import { NextRequest, NextResponse } from 'next/server';

// Define types for Mistral API responses for better type safety
interface MistralFile {
  id: string;
  object: string;
  size_bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
}

interface MistralSignedUrl {
  url: string;
}

interface MistralOcrPage {
  index: number;
  markdown: string;
  images?: unknown[]; // Use unknown[] instead of any[]
  dimensions?: unknown; // Use unknown instead of any
}

interface MistralOcrResponse {
  pages: MistralOcrPage[];
  model: string;
  usage_info: unknown; // Use unknown instead of any
}


export async function POST(request: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    console.error('MISTRAL_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Please upload a PDF.' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // --- Step 1: Upload file to Mistral ---
    const uploadFormData = new FormData();
    uploadFormData.append('purpose', 'ocr');
    uploadFormData.append('file', file, file.name); // Pass filename explicitly

    const uploadResponse = await fetch('https://api.mistral.ai/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // 'Content-Type' is set automatically by fetch for FormData
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Mistral file upload failed:', uploadResponse.status, errorText);
      throw new Error(`Mistral file upload failed: ${uploadResponse.status} ${errorText}`);
    }

    const uploadedFileData: MistralFile = await uploadResponse.json();
    console.log('File uploaded successfully:', uploadedFileData.id);


    // --- Step 2: Get Signed URL ---
    // Wait a moment for the file to be fully processed on Mistral's side before getting the URL
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    const signedUrlResponse = await fetch(`https://api.mistral.ai/v1/files/${uploadedFileData.id}/url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!signedUrlResponse.ok) {
       const errorText = await signedUrlResponse.text();
       console.error('Mistral get signed URL failed:', signedUrlResponse.status, errorText);
       // Attempt to delete the uploaded file if getting URL fails
       await fetch(`https://api.mistral.ai/v1/files/${uploadedFileData.id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${apiKey}` }
       });
       throw new Error(`Mistral get signed URL failed: ${signedUrlResponse.status} ${errorText}`);
    }

    const signedUrlData: MistralSignedUrl = await signedUrlResponse.json();
    console.log('Signed URL obtained:', signedUrlData.url);

    // --- Step 3: Process document with OCR ---
    const ocrApiResponse = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: signedUrlData.url,
          },
          // include_image_base64: false // Optional: set to true if you need images
        }),
    });

    // --- Step 4: Clean up uploaded file (optional but recommended) ---
    // Delete the file from Mistral storage after processing
    try {
        const deleteResponse = await fetch(`https://api.mistral.ai/v1/files/${uploadedFileData.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (deleteResponse.ok) {
            console.log(`Successfully deleted uploaded file: ${uploadedFileData.id}`);
        } else {
            console.warn(`Failed to delete uploaded file ${uploadedFileData.id}: ${deleteResponse.status} ${await deleteResponse.text()}`);
        }
    } catch (deleteError) {
        console.warn(`Error deleting uploaded file ${uploadedFileData.id}:`, deleteError);
    }
    // --- End Cleanup ---


    if (!ocrApiResponse.ok) {
      const errorText = await ocrApiResponse.text();
      console.error('Mistral OCR processing failed:', ocrApiResponse.status, errorText);
      throw new Error(`Mistral OCR processing failed: ${ocrApiResponse.status} ${errorText}`);
    }

    const ocrResult: MistralOcrResponse = await ocrApiResponse.json();

    // Combine markdown from all pages
    const combinedMarkdown = ocrResult.pages.map(page => page.markdown).join('\n\n---\n\n'); // Add separator between pages

    console.log('OCR processing successful.');
    return NextResponse.json({ markdown: combinedMarkdown });

  } catch (error: unknown) { // Use unknown instead of any
    console.error('Error processing PDF:', error);
    // Add type check for error before accessing properties
    const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string>('Copy');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null); // Clear previous errors
      setMarkdown(''); // Clear previous markdown
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
      setMarkdown('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMarkdown('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (err: unknown) {
      console.error('Error uploading file:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message || 'Failed to process PDF. Check the console for details.');
      setMarkdown('');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = file?.name.replace(/\.pdf$/i, '.md') || 'output.md';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!markdown || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('Failed!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24 bg-gray-50">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Gabe&apos;s OCR</h1>

        <div className="w-full bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div>
              <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Upload PDF File
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                disabled={isLoading}
              />
              {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
            </div>

            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Convert to Markdown'
              )}
            </button>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {markdown && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
                <h2 className="text-xl font-semibold text-gray-800">OCR Result</h2>
                <div className="flex items-center flex-wrap gap-2 space-x-4">
                  <div className="flex items-center">
                    <span className={`mr-2 text-sm font-medium ${!showRaw ? 'text-blue-600' : 'text-gray-500'}`}>Rendered</span>
                    <label htmlFor="view-toggle" className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="view-toggle" className="sr-only peer" checked={showRaw} onChange={() => setShowRaw(!showRaw)} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    <span className={`ml-2 text-sm font-medium ${showRaw ? 'text-blue-600' : 'text-gray-500'}`}>Raw</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    disabled={!markdown}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg shadow transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed 
                      ${copyStatus === 'Copied!' ? 'bg-green-100 text-green-700' : 
                       copyStatus === 'Failed!' ? 'bg-red-100 text-red-700' : 
                       'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'}
                    `}
                  >
                    {copyStatus}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    disabled={!markdown}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                    Download .md
                  </button>
                </div>
              </div>

              <div className="prose max-w-none text-gray-900 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] max-h-[60vh] overflow-y-auto">
                {showRaw ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">{markdown}</pre>
                ) : (
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

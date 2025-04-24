import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray[900]'),
            '--tw-prose-headings': theme('colors.gray[900]'),
            '--tw-prose-lead': theme('colors.gray[700]'),
            '--tw-prose-links': theme('colors.blue[700]'),
            '--tw-prose-bold': theme('colors.gray[900]'),
            '--tw-prose-counters': theme('colors.gray[600]'),
            '--tw-prose-bullets': theme('colors.gray[400]'),
            '--tw-prose-hr': theme('colors.gray[300]'),
            '--tw-prose-quotes': theme('colors.gray[900]'),
            '--tw-prose-quote-borders': theme('colors.gray[300]'),
            '--tw-prose-captions': theme('colors.gray[700]'),
            '--tw-prose-code': theme('colors.indigo[600]'),
            '--tw-prose-pre-code': theme('colors.indigo[900]'),
            '--tw-prose-pre-bg': theme('colors.gray[100]'),
            '--tw-prose-th-borders': theme('colors.gray[300]'),
            '--tw-prose-td-borders': theme('colors.gray[200]'),
            h1: {
              fontWeight: '700',
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.4'),
            },
            h2: {
              fontWeight: '600',
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.3'),
            },
            h3: {
              fontWeight: '600',
              marginTop: theme('spacing.5'),
              marginBottom: theme('spacing.2'),
            },
            p: {
              lineHeight: theme('lineHeight.relaxed'),
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
            },
            a: {
              fontWeight: '600',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            code: {
              fontWeight: '500',
              padding: '0.2em 0.4em',
              margin: '0',
              fontSize: '85%',
              backgroundColor: theme('colors.gray[100]'),
              borderRadius: '3px',
            },
            pre: {
              padding: theme('spacing.4'),
              borderRadius: theme('borderRadius.md'),
            },
            ul: {
              marginTop: theme('spacing.3'),
              marginBottom: theme('spacing.3'),
              paddingLeft: theme('spacing.5'),
            },
            ol: {
              marginTop: theme('spacing.3'),
              marginBottom: theme('spacing.3'),
              paddingLeft: theme('spacing.5'),
            },
            li: {
              marginTop: theme('spacing.1'),
              marginBottom: theme('spacing.1'),
            },
            blockquote: {
              marginTop: theme('spacing.5'),
              marginBottom: theme('spacing.5'),
              paddingLeft: theme('spacing.4'),
              fontWeight: '500',
              fontStyle: 'italic',
              borderLeftWidth: '0.25rem',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config; 
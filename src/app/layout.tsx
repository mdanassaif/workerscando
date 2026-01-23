import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://workerscando.com'),
  title: {
    default: 'WorkersCanDo - 100 Tools in 100 Days | Cloudflare Workers',
    template: '%s | WorkersCanDo'
  },
  description: 'A collection of 100 micro-tools powered by Cloudflare Workers. One new tool, every single day. Fast, focused, and free to use. Built at the edge for lightning-fast global response times.',
  keywords: [
    'cloudflare workers',
    'edge computing',
    'serverless',
    'micro-tools',
    'developer tools',
    'cloudflare',
    'workers',
    'edge functions',
    'jamstack',
    'api',
    'tools',
    'free tools',
    'open source',
    'metadata api',
    'og image generator',
    'url metadata',
    'cloudflare workers tools',
    'edge api',
    'serverless tools',
    'cloudflare workers examples'
  ],
  authors: [{ name: 'WorkersCanDo', url: 'https://workerscando.com' }],
  creator: 'WorkersCanDo',
  publisher: 'WorkersCanDo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://workerscando.com',
    siteName: 'WorkersCanDo',
    title: 'WorkersCanDo - 100 Tools in 100 Days | Cloudflare Workers',
    description: 'A collection of 100 micro-tools powered by Cloudflare Workers. Fast, focused, and free to use.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WorkersCanDo - 100 Tools in 100 Days',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mdanassaif',
    creator: '@mdanassaif',
    title: 'WorkersCanDo - 100 Tools in 100 Days',
    description: 'A collection of 100 micro-tools powered by Cloudflare Workers. Fast, focused, and free to use.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://workerscando.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WorkersCanDo',
    description: 'A collection of 100 micro-tools powered by Cloudflare Workers',
    url: 'https://workerscando.com',
    creator: {
      '@type': 'Person',
      name: 'WorkersCanDo Team',
      url: 'https://x.com/mdanassaif',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://workerscando.com/projects?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="vNzZucODIrqYLu0gpfjRLw"
          async
        />
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://faith-tracker.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Faith Tracker - Discover Places of Worship Across India',
    template: '%s | Faith Tracker',
  },
  description:
    "Explore 51,558+ places of worship across India. Find temples, mosques, churches, gurudwaras, and more. Interactive maps with faith-based filtering and Google ratings.",
  keywords: [
    'places of worship india',
    'temples india',
    'mosques india',
    'churches india',
    'gurudwaras india',
    'religious sites map',
    'faith tracker',
    'worship places finder',
    'hyderabad temples',
    'telangana religious sites',
  ],
  authors: [{ name: 'Faith Tracker Contributors', url: siteUrl }],
  creator: 'Faith Tracker',
  publisher: 'Faith Tracker',
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Faith Tracker',
    title: 'Faith Tracker - Discover Places of Worship Across India',
    description:
      "Explore 51,558+ places of worship across India. Find temples, mosques, churches, gurudwaras, and more with interactive maps.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Faith Tracker - Places of Worship in India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@faithtracker',
    creator: '@faithtracker',
    title: 'Faith Tracker - Discover Places of Worship Across India',
    description:
      'Interactive map of 51,558+ places of worship across India. Temples, mosques, churches, gurudwaras & more.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-IN': siteUrl,
      'hi-IN': siteUrl,
    },
  },
  category: 'religious sites',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Faith Tracker',
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  description: 'Interactive map of places of worship across India',
  sameAs: [
    'https://github.com/faith-tracker/faith-tracker',
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

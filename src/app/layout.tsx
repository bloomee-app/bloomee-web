import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Bloomee - Visualizing Earth\'s Bloom Events',
    template: '%s | Bloomee'
  },
  description: 'Turning satellite data into ecological insight. An interactive 3D platform for tracking and analyzing global bloom events using NASA Earth observation data.',
  keywords: [
    'satellite data',
    'earth observation',
    'bloom events',
    'ecological monitoring',
    'NASA data',
    '3D visualization',
    'environmental science',
    'remote sensing',
    'climate monitoring',
    'ecosystem analysis'
  ],
  authors: [{ name: 'Bloomee Team' }],
  creator: 'Bloomee',
  publisher: 'Bloomee',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bloomee.earth',
    siteName: 'Bloomee',
    title: 'Bloomee - Visualizing Earth\'s Bloom Events',
    description: 'Turning satellite data into ecological insight. An interactive 3D platform for tracking and analyzing global bloom events using NASA Earth observation data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bloomee - Earth Bloom Events Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloomee - Visualizing Earth\'s Bloom Events',
    description: 'Turning satellite data into ecological insight. An interactive 3D platform for tracking and analyzing global bloom events using NASA Earth observation data.',
    images: ['/og-image.png'],
    creator: '@bloomee',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://bloomee.earth'),
  alternates: {
    canonical: '/',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Runs synchronously before first paint so visitors who already dismissed the migration
          notice never see the server-rendered copy flash. The notice itself now renders on the
          server (see src/components/notice/MigrationNotice.tsx) so that it survives anywhere
          our JS does not run - Wayback captures in particular - and React removes the node
          shortly after mount. The storage key is duplicated here on purpose: an inline script
          cannot import DISMISSED_KEY.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('bloome-migration-notice-dismissed')==='true')" +
              "document.documentElement.dataset.migrationNoticeDismissed='true'}catch{}",
          }}
        />

        {/*
          The globe fetches these from JS, so they are invisible to crawlers and archivers and
          never get captured. Naming them in the HTML both fixes that and shortens first paint.
        */}
        <link rel="preload" as="image" href="/textures/00_earthmap1k.jpg" />
        <link rel="preload" as="image" href="/textures/01_earthbump1k.jpg" />
        <link rel="preload" as="image" href="/textures/02_earthspec1k.jpg" />
        <link rel="preload" as="image" href="/textures/04_rainbow1k.jpg" />
        <link rel="preload" as="image" href="/textures/circle.png" />

        <Script
          src="https://stat.faizath.com/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
          data-domains={process.env.NEXT_PUBLIC_UMAMI_DOMAINS}
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

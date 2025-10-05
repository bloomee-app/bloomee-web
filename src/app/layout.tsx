import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
    url: 'https://bloome.earth',
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
  metadataBase: new URL('https://bloome.earth'),
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import MobileMenu from './components/MobileMenu'

export const metadata: Metadata = {
  title: 'WSJ Crossword Answers - Daily Solutions & Clues',
  description: 'Get instant access to Wall Street Journal crossword answers, clues, and solutions. Updated daily with the latest WSJ crossword puzzles.',
  keywords: 'WSJ crossword, Wall Street Journal crossword answers, crossword solutions, daily crossword, crossword clues',
  authors: [{ name: 'WSJ Crossword Answers' }],
  creator: 'WSJ Crossword Answers',
  publisher: 'WSJ Crossword Answers',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://crosswordwiki.com'),
  alternates: {
    canonical: 'https://crosswordwiki.com',
  },
  openGraph: {
    title: 'WSJ Crossword Answers - Daily Solutions',
    description: 'Daily Wall Street Journal crossword answers and solutions',
    type: 'website',
    locale: 'en_US',
    url: 'https://crosswordwiki.com',
    siteName: 'WSJ Crossword Answers',
    images: [
      {
        url: 'https://crosswordwiki.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WSJ Crossword Answers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WSJ Crossword Answers',
    description: 'Daily Wall Street Journal crossword answers and solutions',
    creator: '@wsjcrossword',
    images: ['https://crosswordwiki.com/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WSJ Crossword Answers",
    "description": "Get instant access to Wall Street Journal crossword answers, clues, and solutions. Updated daily with the latest WSJ crossword puzzles.",
    "url": "https://crosswordwiki.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://crosswordwiki.com/answers?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WSJ Crossword Answers",
      "url": "https://crosswordwiki.com"
    }
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    WSJ Crossword Answers
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">
                    Daily Wall Street Journal crossword solutions
                  </p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                <a href="/" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Today
                </a>
                <a href="/answers" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  All Answers
                </a>
                <a href="/archive" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Archive
                </a>
              </nav>

              {/* Mobile Menu Component */}
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Today's Answers</a></li>
                  <li><a href="/answers" className="text-gray-600 hover:text-blue-600 transition-colors">All Answers</a></li>
                  <li><a href="/archive" className="text-gray-600 hover:text-blue-600 transition-colors">Archive</a></li>
                </ul>
              </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><a href="/sitemap.xml" className="text-gray-600 hover:text-blue-600 transition-colors">Sitemap</a></li>
                    <li><a href="https://www.wsj.com/puzzles/crossword" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">WSJ Crossword</a></li>
                  </ul>
                </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get instant access to Wall Street Journal crossword answers and solutions. 
                  Updated daily with the latest WSJ crossword puzzles.
                </p>
                <p className="text-gray-500 text-xs">
                  Not affiliated with The Wall Street Journal.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-600 text-sm">
                © 2025 WSJ Crossword Answers. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

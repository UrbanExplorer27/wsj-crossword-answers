import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WSJ Crossword Answers - Daily Solutions & Clues',
    short_name: 'WSJ Crossword',
    description: 'Get instant access to Wall Street Journal crossword answers, clues, and solutions. Updated daily with the latest WSJ crossword puzzles.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}



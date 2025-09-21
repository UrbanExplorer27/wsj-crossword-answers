import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload WSJ Crossword Answers | Daily Solutions',
  description: 'Upload Wall Street Journal crossword puzzles and get instant answers. Support for images, PDFs, text, and manual answer entry.',
  keywords: ['upload crossword', 'WSJ crossword upload', 'crossword answers', 'puzzle solutions'],
  alternates: {
    canonical: 'https://wsj-crossword-answers.vercel.app/upload',
  },
  openGraph: {
    title: 'Upload WSJ Crossword Answers | Daily Solutions',
    description: 'Upload Wall Street Journal crossword puzzles and get instant answers. Support for images, PDFs, text, and manual answer entry.',
    type: 'website',
    url: 'https://wsj-crossword-answers.vercel.app/upload',
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

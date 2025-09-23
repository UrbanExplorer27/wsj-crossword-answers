import { getTodayAnswers, getAllDates } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/app/components/Breadcrumbs'

interface PageProps {
  params: Promise<{
    date: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params
  const answers = await getTodayAnswers(date)
  
  if (!answers) {
    return {
      title: 'WSJ Crossword Answers Not Found',
      description: 'The requested WSJ crossword answers are not available.',
      alternates: {
        canonical: `https://crosswordwiki.com/${date}`,
      },
    }
  }

  const dateStr = new Date(answers.date + 'T00:00:00').toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return {
    title: `WSJ Crossword ${answers.date} Answers (${answers.date})`,
    description: `Complete answers and solutions for the Wall Street Journal crossword puzzle from ${dateStr}. ${answers.total_answers || answers.answers.length} answers included with individual answer pages.`,
    keywords: `WSJ crossword ${answers.date} answers, Wall Street Journal crossword ${answers.date}, ${dateStr}, crossword solutions, crossword clues, ${answers.date}`,
    alternates: {
      canonical: `https://crosswordwiki.com/${date}`,
    },
    openGraph: {
      title: `WSJ Crossword ${answers.date} Answers (${answers.date})`,
      description: `Complete answers for the WSJ crossword from ${dateStr}`,
      type: 'article',
      publishedTime: answers.uploaded_at || answers.scrapedAt,
      url: `https://crosswordwiki.com/${date}`,
    },
  }
}

export default async function DatePage({ params }: PageProps) {
  const { date } = await params
  const answers = await getTodayAnswers(date)
  const allDates = await getAllDates()
  
  if (!answers) {
    notFound()
  }

  const currentIndex = allDates.indexOf(date)
  const prevDate = allDates[currentIndex + 1] || null
  const nextDate = allDates[currentIndex - 1] || null

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: `WSJ Crossword ${answers.date}`, href: `/${answers.date}` }
      ]} />
      
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            WSJ Crossword Answers
          </h1>
          <p className="text-lg text-gray-600">
            {new Date(answers.date + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {prevDate && (
            <Link 
              href={`/${prevDate}`}
              className="nav-button nav-button-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          )}
          <Link 
            href="/"
            className="nav-button nav-button-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Today
          </Link>
          {nextDate && (
            <Link 
              href={`/${nextDate}`}
              className="nav-button nav-button-secondary"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{answers.total_answers || answers.answers.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Answers</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Answers Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Answers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {answers.answers.map((answer, index) => {
            const slug = answer.clue
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            
            return (
              <a
                key={index}
                href={`/answer/${slug}`}
                className="answer-card hover:shadow-lg hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="position-badge">{answer.position}</span>
                </div>
                <div className="clue-text mb-2">{answer.clue}</div>
                <div className="answer-text">{answer.answer}</div>
                <div className="text-xs text-blue-600 mt-2 font-medium">
                  View full answer page →
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          WSJ Crossword {answers.date} Answers ({answers.date})
        </h2>
        <p className="text-gray-700 mb-4">
          Complete solutions for the Wall Street Journal crossword puzzle from {new Date(answers.date + 'T00:00:00').toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}. This page contains all {answers.total_answers || answers.answers.length} crossword answers with their corresponding clues.
        </p>
        <p className="text-gray-700 mb-4">
          Click on any answer to view its dedicated page with detailed explanations and SEO optimization.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Individual Answer Pages:</strong> Each crossword clue has its own optimized page targeting 
          specific search terms like "{answers.answers[0]?.clue} crossword answer" for maximum SEO visibility.
        </p>
      </div>
    </div>
  )
}

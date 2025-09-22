import { getTodayAnswers, getAllDates } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import SearchBox from '@/app/components/SearchBox'

export async function generateMetadata() {
  const today = new Date().toISOString().split('T')[0]
  const answers = await getTodayAnswers(today)
  
  if (!answers) {
    return {
      title: 'WSJ Crossword Answers - Daily Solutions & Clues',
      description: 'Get instant access to Wall Street Journal crossword answers, clues, and solutions. Updated daily with the latest WSJ crossword puzzles.',
      alternates: {
        canonical: `https://crosswordwiki.com/`,
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
    title: `WSJ Crossword Answers ${answers.date} - Daily Solutions & Clues`,
    description: `Complete answers and solutions for the Wall Street Journal crossword puzzle from ${dateStr}. ${answers.total_answers || answers.answers.length} answers included with individual answer pages.`,
    keywords: `WSJ crossword ${answers.date} answers, Wall Street Journal crossword, ${dateStr}, crossword solutions, crossword clues, daily crossword`,
    alternates: {
      canonical: `https://crosswordwiki.com/`,
    },
    openGraph: {
      title: `WSJ Crossword Answers ${answers.date} - Daily Solutions & Clues`,
      description: `Complete answers for the WSJ crossword from ${dateStr}`,
      type: 'article',
      publishedTime: answers.uploaded_at || answers.scrapedAt,
      url: `https://crosswordwiki.com/`,
    },
  }
}

export default async function HomePage() {
  const today = new Date().toISOString().split('T')[0]
  const answers = await getTodayAnswers(today)
  const allDates = await getAllDates()
  
  if (!answers) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          No Answers Available
        </h1>
        <p className="text-gray-600 mb-8">
          We're working on getting today's WSJ crossword answers. Check back soon!
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> Answers are automatically updated daily at 6 AM EST
          </p>
        </div>
      </div>
    )
  }

  const prevDate = allDates[allDates.indexOf(today) + 1] || null
  const nextDate = allDates[allDates.indexOf(today) - 1] || null

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' }
      ]} />
      
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            WSJ Crossword Answers
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {new Date(answers.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          {prevDate && (
            <Link 
              href={`/${prevDate}`}
              className="nav-button nav-button-secondary text-sm sm:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          )}
          {nextDate && (
            <Link 
              href={`/${nextDate}`}
              className="nav-button nav-button-secondary text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">All Answers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                  <span className="position-badge text-xs px-2 py-1">{answer.position}</span>
                </div>
                <div className="clue-text mb-2 text-sm sm:text-base">{answer.clue}</div>
                <div className="answer-text text-xl sm:text-2xl lg:text-3xl">{answer.answer}</div>
                <div className="text-xs text-blue-600 mt-2 font-medium">
                  View full answer page →
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Search by Answer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Search Answers</h2>
        </div>
        <SearchBox />
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          WSJ Crossword Answers for {new Date(answers.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        <p className="text-gray-700 mb-4">
          Find all the answers to today's Wall Street Journal crossword puzzle. Our automated system 
          extracts answers from the WSJ crossword and presents them in an easy-to-browse format.
        </p>
        <p className="text-gray-700 mb-4">
          This page contains {answers.total_answers || answers.answers.length} crossword answers with their corresponding clues.
        </p>
      </div>
    </div>
  )
}

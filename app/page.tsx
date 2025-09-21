import { getTodayAnswers, getAllDates } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            WSJ Crossword Answers
          </h1>
          <p className="text-lg text-gray-600">
            {new Date(answers.date).toLocaleDateString('en-US', { 
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{answers.totalAnswers}</div>
              <div className="text-sm text-gray-600 font-medium">Total Answers</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {answers.answers.filter(a => a.confidence > 0.8).length}
              </div>
              <div className="text-sm text-gray-600 font-medium">High Confidence</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-600">
                {new Date(answers.scrapedAt).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600 font-medium">Last Updated</div>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Answers Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Answers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {answers.answers.map((answer, index) => (
            <div key={index} className="answer-card">
              <div className="flex justify-between items-start mb-2">
                <span className="position-badge">{answer.position}</span>
                <span className={`text-xs font-medium ${
                  answer.confidence > 0.8 ? 'confidence-high' :
                  answer.confidence > 0.5 ? 'confidence-medium' : 'confidence-low'
                }`}>
                  {Math.round(answer.confidence * 100)}% confidence
                </span>
              </div>
              <div className="clue-text mb-2">{answer.clue}</div>
              <div className="answer-text">{answer.answer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search by Answer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Search Answers</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a specific answer or clue..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            id="answer-search"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div id="search-results" className="mt-6 space-y-3"></div>
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
          This page contains {answers.totalAnswers} crossword answers with their corresponding clues. 
          Each answer includes a confidence score based on our AI analysis of the puzzle.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface AnswerCardProps {
  answer: string
  position: string
  clue: string
  date: string
  slug: string
}

export default function AnswerCard({ answer, position, clue, date, slug }: AnswerCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to answer page
    setIsRevealed(true)
  }

  return (
    <div className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {clue}
        </h3>
        
        <div className="mb-2">
          {isRevealed ? (
            <div className="text-2xl font-bold text-blue-600 animate-fade-in">
              {answer}
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-400">
              ????
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{position}</span>
          {!isRevealed && (
            <button
              onClick={handleReveal}
              className="text-blue-600 hover:text-blue-700 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Reveal
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-400">
        {new Date(date).toLocaleDateString()}
      </div>
      
      {isRevealed && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={`/answer/${slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View full answer →
          </a>
        </div>
      )}
    </div>
  )
}

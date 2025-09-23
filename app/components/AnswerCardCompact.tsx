'use client'

import { useState } from 'react'

interface AnswerCardCompactProps {
  answer: string
  position: string
  clue: string
  slug: string
}

export default function AnswerCardCompact({ answer, position, clue, slug }: AnswerCardCompactProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to answer page
    setIsRevealed(true)
  }

  const handleCardClick = () => {
    if (isRevealed) {
      window.location.href = `/answer/${slug}`
    }
  }

  return (
    <div
      className="answer-card hover:shadow-lg hover:border-blue-200 transition-all relative group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="position-badge text-xs px-2 py-1">{position}</span>
        {!isRevealed && (
          <button
            onClick={handleReveal}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Reveal
          </button>
        )}
      </div>
      <div className="clue-text mb-2 text-sm sm:text-base">{clue}</div>
      
      {/* Answer with question mark overlay */}
      <div className="relative">
        {isRevealed ? (
          <div className="answer-text text-xl sm:text-2xl lg:text-3xl animate-fade-in">
            {answer}
          </div>
        ) : (
          <div className="answer-text text-xl sm:text-2xl lg:text-3xl text-gray-400">
            ????
          </div>
        )}
      </div>
      
      <div className="text-xs text-blue-600 mt-2 font-medium">
        {isRevealed ? 'Click to view full answer →' : 'Click "Reveal" to see answer'}
      </div>
    </div>
  )
}

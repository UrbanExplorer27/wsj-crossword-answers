'use client'

import { useState } from 'react'

interface AnswerRevealProps {
  answer: string
  position: string
  clue: string
}

export default function AnswerReveal({ answer, position, clue }: AnswerRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-sm text-blue-600 font-medium mb-2">
          Position: {position}
        </div>
        <div className="relative">
          {isRevealed ? (
            <div className="text-6xl font-bold text-blue-700 mb-4 animate-fade-in" id="main-answer">
              {answer}
            </div>
          ) : (
            <div className="text-6xl font-bold text-gray-400 mb-4" id="main-question">
              ????
            </div>
          )}
        </div>
        {!isRevealed ? (
          <button
            onClick={handleReveal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Reveal Answer
          </button>
        ) : (
          <div className="text-sm text-green-600 font-medium">
            ✓ Answer revealed!
          </div>
        )}
      </div>
    </div>
  )
}

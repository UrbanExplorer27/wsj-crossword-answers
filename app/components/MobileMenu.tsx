'use client'

import { useState } from 'react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMenu}
        className="mobile-menu-button md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Navigation Menu */}
      <div 
        className={`mobile-menu-transition md:hidden border-t border-gray-200 pt-4 pb-4 ${
          isOpen ? 'mobile-menu-visible' : 'mobile-menu-hidden'
        }`}
      >
        <nav className="flex flex-col space-y-2">
          <a 
            href="/" 
            onClick={closeMenu}
            className="mobile-menu-link px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            Today
          </a>
          <a 
            href="/answers" 
            onClick={closeMenu}
            className="mobile-menu-link px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            All Answers
          </a>
          <a 
            href="/archive" 
            onClick={closeMenu}
            className="mobile-menu-link px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            Archive
          </a>
        </nav>
      </div>
    </>
  )
}

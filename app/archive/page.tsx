import { getAllDates } from '@/lib/data'
import Link from 'next/link'

export const metadata = {
  title: 'WSJ Crossword Archive - All Previous Answers',
  description: 'Browse all previous WSJ crossword answers and solutions in our comprehensive archive.',
  keywords: 'WSJ crossword archive, Wall Street Journal crossword history, crossword answers archive',
  alternates: {
    canonical: 'https://wsj-crossword-answers.vercel.app/archive',
  },
  openGraph: {
    title: 'WSJ Crossword Archive - All Previous Answers',
    description: 'Browse all previous WSJ crossword answers and solutions in our comprehensive archive.',
    type: 'website',
    url: 'https://wsj-crossword-answers.vercel.app/archive',
  },
}

export default async function ArchivePage() {
  const allDates = await getAllDates()
  
  // Group dates by year and month
  const groupedDates = allDates.reduce((acc, date) => {
    const year = new Date(date + 'T00:00:00').getFullYear()
    const month = new Date(date + 'T00:00:00').getMonth()
    const monthName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long' })
    
    if (!acc[year]) {
      acc[year] = {}
    }
    if (!acc[year][monthName]) {
      acc[year][monthName] = []
    }
    
    acc[year][monthName].push(date)
    return acc
  }, {} as Record<number, Record<string, string[]>>)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          WSJ Crossword Archive
        </h1>
        <p className="text-lg text-gray-600">
          Browse all previous WSJ crossword answers and solutions
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedDates)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, months]) => (
            <div key={year}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(months)
                  .sort(([a], [b]) => {
                    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                                     'July', 'August', 'September', 'October', 'November', 'December']
                    return monthOrder.indexOf(b) - monthOrder.indexOf(a)
                  })
                  .map(([month, dates]) => (
                    <div key={month} className="bg-white rounded-lg shadow-sm border p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{month}</h3>
                      <div className="space-y-1">
                        {dates.map((date) => (
                          <Link
                            key={date}
                            href={`/${date}`}
                            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {allDates.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            No Archive Data Available
          </h2>
          <p className="text-gray-600">
            Check back soon for archived crossword answers.
          </p>
        </div>
      )}
    </div>
  )
}

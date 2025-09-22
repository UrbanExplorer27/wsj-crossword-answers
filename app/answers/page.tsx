import { readAnswersData } from '@/lib/data';
import { Metadata } from 'next';
import Breadcrumbs from '@/app/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'WSJ Crossword Answers | Complete Solutions',
  description: 'Browse all Wall Street Journal crossword answers and solutions. Find answers to any crossword clue with our comprehensive database.',
  keywords: ['WSJ crossword answers', 'Wall Street Journal crossword', 'crossword solutions', 'puzzle answers'],
  alternates: {
    canonical: 'https://crosswordwiki.com/answers',
  },
  openGraph: {
    title: 'WSJ Crossword Answers | Complete Solutions',
    description: 'Browse all Wall Street Journal crossword answers and solutions. Find answers to any crossword clue with our comprehensive database.',
    type: 'website',
    url: 'https://crosswordwiki.com/answers',
  },
};

export default function AnswersPage() {
  const answersData = readAnswersData();
  const allAnswers: any[] = [];

  // Flatten all answers from all dates
  Object.values(answersData).forEach((dayData: any) => {
    if (dayData.answers) {
      dayData.answers.forEach((answer: any) => {
        allAnswers.push({
          ...answer,
          date: dayData.date,
        });
      });
    }
  });

  // Sort by date (newest first)
  allAnswers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generateSlug = (clue: string) => {
    return clue
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'All Answers', href: '/answers' }
      ]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          WSJ Crossword Answers
        </h1>
        <p className="text-xl text-gray-600">
          Complete collection of Wall Street Journal crossword solutions
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {allAnswers.length} answers available
        </p>
      </div>

      {/* Search/Filter */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Search crossword answers..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Answers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAnswers.map((answer, index) => {
          const slug = generateSlug(answer.clue);
          
          return (
            <a
              key={index}
              href={`/answer/${slug}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {answer.clue}
                </h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {answer.answer}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{answer.position}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                {new Date(answer.date).toLocaleDateString()}
              </div>
            </a>
          );
        })}
      </div>

      {allAnswers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No answers yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload a crossword puzzle to get started
          </p>
          <a
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Crossword
          </a>
        </div>
      )}
    </div>
  );
}

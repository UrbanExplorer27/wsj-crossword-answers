import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { readAnswersData } from '@/lib/data';

interface AnswerPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all answer pages
export async function generateStaticParams() {
  const answersData = readAnswersData();
  const params: { slug: string }[] = [];

  Object.values(answersData).forEach((dayData: any) => {
    dayData.answers?.forEach((answer: any) => {
      const slug = answer.clue
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      params.push({ slug });
    });
  });

  return params;
}

// Generate metadata for each answer page
export async function generateMetadata({ params }: AnswerPageProps): Promise<Metadata> {
  const answersData = readAnswersData();
  const answer = findAnswerBySlug(answersData, params.slug);

  if (!answer) {
    return {
      title: 'Answer Not Found',
      alternates: {
        canonical: `https://wsj-crossword-answers.vercel.app/answer/${params.slug}`,
      },
    };
  }

  const title = `${answer.clue} Crossword Answer | WSJ`;
  const description = `Find the answer to "${answer.clue}" from the WSJ crossword puzzle. Complete crossword solution and more answers.`;

  return {
    title,
    description,
    keywords: [
      answer.clue.toLowerCase(),
      'crossword answer',
      'WSJ crossword',
      'Wall Street Journal crossword',
      answer.answer.toLowerCase(),
      'crossword solution',
      'puzzle answer'
    ],
    alternates: {
      canonical: `https://wsj-crossword-answers.vercel.app/answer/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://wsj-crossword-answers.vercel.app/answer/${params.slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

function findAnswerBySlug(answersData: any, slug: string) {
  for (const dayData of Object.values(answersData)) {
    const answer = (dayData as any).answers?.find((a: any) => {
      const answerSlug = a.clue
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      return answerSlug === slug;
    });
    if (answer) return answer;
  }
  return null;
}

export default function AnswerPage({ params }: AnswerPageProps) {
  const answersData = readAnswersData();
  const answer = findAnswerBySlug(answersData, params.slug);

  if (!answer) {
    notFound();
  }


  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {answer.clue} Crossword Answer
          </h1>
          <p className="text-lg text-gray-600">
            Wall Street Journal Crossword Puzzle Solution
          </p>
        </div>

        {/* Answer Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
          <div className="text-center">
            <div className="text-sm text-blue-600 font-medium mb-2">
              Position: {answer.position}
            </div>
            <div className="text-6xl font-bold text-blue-700 mb-4">
              {answer.answer}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Answer to "{answer.clue}"
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            The answer to the crossword clue <strong>"{answer.clue}"</strong> is <strong>"{answer.answer}"</strong>. 
            This clue appeared in position {answer.position} of the Wall Street Journal crossword puzzle.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            About This Answer
          </h3>
          
          <p className="text-gray-700 mb-4">
            This crossword answer was extracted using advanced AI technology to help crossword enthusiasts 
            find solutions quickly and accurately. The WSJ crossword puzzle is known for its challenging 
            clues and clever wordplay.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Crossword Tips
          </h3>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Look for wordplay and double meanings in clues</li>
            <li>Consider abbreviations and common crossword answers</li>
            <li>Use the crossing letters to help narrow down possibilities</li>
            <li>Don't be afraid to think outside the box</li>
          </ul>
        </div>

        {/* Related Answers */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            More WSJ Crossword Answers
          </h3>
          <p className="text-gray-600 mb-4">
            Looking for more crossword solutions? Browse our complete collection of WSJ crossword answers.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Answers
          </a>
        </div>
      </div>
    </div>
  );
}

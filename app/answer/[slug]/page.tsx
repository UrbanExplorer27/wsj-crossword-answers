import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { readAnswersData } from '@/lib/data';
import StructuredData from '@/app/components/StructuredData';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import AnswerReveal from '@/app/components/AnswerReveal';

interface AnswerPageProps {
  params: Promise<{
    slug: string;
  }>;
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
  const { slug } = await params
  const answersData = readAnswersData();
  let foundAnswer: any = null;

  Object.entries(answersData).forEach(([date, dayData]: [string, any]) => {
    dayData.answers.forEach((answer: any) => {
      const answerSlug = answer.clue
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      if (answerSlug === slug) {
        foundAnswer = answer;
      }
    });
  });

  if (!foundAnswer) {
    return {
      title: 'Answer Not Found',
      alternates: {
        canonical: `https://crosswordwiki.com/answer/${slug}`,
      },
    };
  }

  const cleanClue = foundAnswer.clue.replace(/^Answer for /, '');
  const title = `${cleanClue} answer`;
  const description = `Find the answer to "${cleanClue}" from the WSJ crossword puzzle. Complete crossword solution and more answers.`;

  return {
    title,
    description,
    keywords: [
      foundAnswer.clue.toLowerCase(),
      'crossword answer',
      'WSJ crossword',
      'Wall Street Journal crossword',
      foundAnswer.answer.toLowerCase(),
      'crossword solution',
      'puzzle answer'
    ],
    alternates: {
      canonical: `https://crosswordwiki.com/answer/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://crosswordwiki.com/answer/${slug}`,
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

export default async function AnswerPage({ params }: AnswerPageProps) {
  const { slug } = await params
  const answersData = readAnswersData();
  let foundAnswer: any = null;
  let foundDate: string | null = null;

  Object.entries(answersData).forEach(([date, dayData]: [string, any]) => {
    dayData.answers.forEach((answer: any) => {
      const answerSlug = answer.clue
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      if (answerSlug === slug) {
        foundAnswer = answer;
        foundDate = date;
      }
    });
  });

  if (!foundAnswer) {
    notFound();
  }


  return (
    <>
      <StructuredData 
        type="answer" 
        data={{
          ...foundAnswer,
          slug: slug,
          date: foundDate
        }} 
      />
      <div className="max-w-4xl mx-auto p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'All Answers', href: '/answers' },
          { label: foundAnswer.clue, href: `/answer/${slug}` }
        ]} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {foundAnswer.clue.replace(/^Answer for /, '')} answer
          </h1>
          <p className="text-lg text-gray-600">
            Wall Street Journal Crossword Puzzle Solution
          </p>
        </div>

        {/* Answer Reveal Component */}
        <AnswerReveal 
          answer={foundAnswer.answer}
          position={foundAnswer.position}
          clue={foundAnswer.clue}
        />

        {/* SEO Content */}
        <div className="max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Answer to "{foundAnswer.clue.replace(/^Answer for /, '')}"
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            The crossword clue <strong>"{foundAnswer.clue.replace(/^Answer for /, '')}"</strong> appeared in position {foundAnswer.position} of the Wall Street Journal crossword puzzle. 
            Click the "Reveal Answer" button above to see the solution.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            About This Clue
          </h3>
          
          <p className="text-gray-700 mb-4">
            This crossword clue was extracted from the Wall Street Journal crossword puzzle using advanced AI technology. 
            The WSJ crossword is known for its challenging clues and clever wordplay. Once you reveal the answer above, 
            you'll see how the clue relates to the solution.
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
    </>
  );
}

interface StructuredDataProps {
  type: 'answer' | 'date' | 'website'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: any = {}

  if (type === 'answer') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${data.clue} Crossword Answer | WSJ`,
      "description": `Find the answer to "${data.clue}" from the WSJ crossword puzzle. Answer: ${data.answer} (${data.position}).`,
      "url": `https://wsj-crossword-answers.vercel.app/answer/${data.slug}`,
      "datePublished": data.date,
      "dateModified": data.uploaded_at || data.scrapedAt,
      "author": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers",
        "url": "https://wsj-crossword-answers.vercel.app"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://wsj-crossword-answers.vercel.app/answer/${data.slug}`
      },
      "keywords": [
        data.clue.toLowerCase(),
        'crossword answer',
        'WSJ crossword',
        'Wall Street Journal crossword',
        data.answer.toLowerCase(),
        'crossword solution'
      ]
    }
  } else if (type === 'date') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `WSJ Crossword ${data.date} Answers (${data.date})`,
      "description": `Complete answers and solutions for the Wall Street Journal crossword puzzle from ${data.dateStr}. ${data.totalAnswers} answers included.`,
      "url": `https://wsj-crossword-answers.vercel.app/${data.date}`,
      "datePublished": data.date,
      "dateModified": data.uploaded_at || data.scrapedAt,
      "author": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers",
        "url": "https://wsj-crossword-answers.vercel.app"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://wsj-crossword-answers.vercel.app/${data.date}`
      },
      "keywords": [
        `WSJ crossword ${data.date} answers`,
        'Wall Street Journal crossword',
        data.date,
        'crossword solutions',
        'crossword clues'
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

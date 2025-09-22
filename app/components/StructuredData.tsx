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
      "headline": `${data.clue} answer`,
      "description": `Find the answer to "${data.clue}" from the WSJ crossword puzzle. Answer: ${data.answer} (${data.position}).`,
      "url": `https://crosswordwiki.com/answer/${data.slug}`,
      "datePublished": data.date,
      "dateModified": data.uploaded_at || data.scrapedAt,
      "author": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers",
        "url": "https://crosswordwiki.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers",
        "url": "https://crosswordwiki.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crosswordwiki.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://crosswordwiki.com/answer/${data.slug}`
      },
      "keywords": [
        data.clue.toLowerCase(),
        'crossword answer',
        'WSJ crossword',
        'Wall Street Journal crossword',
        data.answer.toLowerCase(),
        'crossword solution'
      ],
      "articleSection": "Crossword Answers",
      "wordCount": data.clue.length + data.answer.length,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "WSJ Crossword Answers",
        "url": "https://crosswordwiki.com"
      }
    }
  } else if (type === 'date') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `WSJ Crossword ${data.date} Answers (${data.date})`,
      "description": `Complete answers and solutions for the Wall Street Journal crossword puzzle from ${data.dateStr}. ${data.total_answers} answers included.`,
      "url": `https://crosswordwiki.com/${data.date}`,
      "datePublished": data.date,
      "dateModified": data.uploaded_at || data.scrapedAt,
      "author": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WSJ Crossword Answers",
        "url": "https://crosswordwiki.com"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://crosswordwiki.com/${data.date}`
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

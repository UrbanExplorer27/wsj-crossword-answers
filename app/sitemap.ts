import { getAllDates, readAnswersData } from '@/lib/data'

export default async function sitemap() {
  const dates = await getAllDates()
  const answersData = readAnswersData()
  const baseUrl = 'https://wsj-crossword-answers.vercel.app'
  
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/answers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]
  
  const datePages = dates.map((date) => ({
    url: `${baseUrl}/${date}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  
  // Generate individual answer pages
  const answerPages: any[] = []
  Object.values(answersData).forEach((dayData: any) => {
    dayData.answers.forEach((answer: any) => {
      const slug = answer.clue
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      answerPages.push({
        url: `${baseUrl}/answer/${slug}`,
        lastModified: new Date(dayData.uploaded_at || dayData.scrapedAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    })
  })
  
  return [...staticPages, ...datePages, ...answerPages]
}

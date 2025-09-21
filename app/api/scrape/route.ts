import { NextRequest, NextResponse } from 'next/server'
import { takeScreenshot, extractAnswersWithOpenAI, saveAnswers } from '@/scripts/scraper'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.API_SECRET_KEY
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting manual scrape via API...')
    
    // Take screenshot
    const screenshotPath = await takeScreenshot()
    
    // Extract answers
    const answers = await extractAnswersWithOpenAI(screenshotPath)
    
    // Save answers
    await saveAnswers(answers)
    
    return NextResponse.json({
      success: true,
      message: 'Scraping completed successfully',
      answersCount: answers.length,
      screenshotPath,
      answers: answers.slice(0, 5) // Return first 5 answers as preview
    })
    
  } catch (error) {
    console.error('❌ API scrape failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WSJ Crossword Scraper API',
    endpoints: {
      POST: '/api/scrape - Trigger manual scraping',
    },
    usage: 'Send POST request to trigger scraping'
  })
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.API_SECRET_KEY
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      message: 'Scraping functionality has been disabled',
      error: 'Playwright dependency was removed. Scraping is no longer available.'
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

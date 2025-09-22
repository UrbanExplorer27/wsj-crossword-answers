import { NextRequest, NextResponse } from 'next/server';
import { readAnswersData } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Get all answers
    const answersData = readAnswersData();
    const allAnswers: any[] = [];

    Object.values(answersData).forEach((dayData: any) => {
      dayData.answers.forEach((answer: any) => {
        const slug = answer.clue
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        
        allAnswers.push({
          ...answer,
          date: dayData.date,
          slug
        });
      });
    });

    // Filter results
    const filtered = allAnswers.filter(answer => 
      answer.clue.toLowerCase().includes(query.toLowerCase()) ||
      answer.answer.toLowerCase().includes(query.toLowerCase()) ||
      answer.position.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results

    return NextResponse.json({ results: filtered });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ results: [] });
  }
}

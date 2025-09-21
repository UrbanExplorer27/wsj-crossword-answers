import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || text.trim() === '') {
    return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
  }

  console.log('📝 Processing manual answers upload...');

  try {
    // Parse the manual answers from the text
    const answers = parseManualAnswers(text);
    
    if (answers.length === 0) {
      return NextResponse.json({ error: 'No valid answers found. Please use format: Position: Answer (e.g., 1A: FASTEN)' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const answersData = {
      date: today,
      answers: answers,
      source: 'manual_answers_upload',
      uploaded_at: new Date().toISOString(),
      total_answers: answers.length,
      high_confidence: answers.filter((a: any) => a.confidence > 0.8).length
    };

    const dataPath = join(process.cwd(), 'data', 'answers.json');
    let allAnswers: Record<string, any> = {};
    try {
      const existingData = fs.readFileSync(dataPath, 'utf8');
      allAnswers = JSON.parse(existingData);
    } catch (error) {
      console.log('No existing answers.json found or file is empty, starting fresh.');
    }
    
    allAnswers[today] = answersData;
    fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
    
    console.log(`💾 Manual answers saved for ${today}`);
    console.log(`📄 Generated ${answers.length} individual answer pages`);

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: today,
      method: 'manual_answers'
    });

  } catch (error) {
    console.error('Error processing manual answers:', error);
    return NextResponse.json({ error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

function parseManualAnswers(text: string): any[] {
  const answers: any[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Try different formats
    const patterns = [
      // Format: 1A: FASTEN
      /^(\d+[AD]):\s*(.+)$/i,
      // Format: 1A - FASTEN
      /^(\d+[AD])\s*-\s*(.+)$/i,
      // Format: 1A FASTEN
      /^(\d+[AD])\s+(.+)$/i,
      // Format: FASTEN (1A)
      /^(.+)\s*\((\d+[AD])\)$/i,
      // Format: FASTEN - 1A
      /^(.+)\s*-\s*(\d+[AD])$/i,
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let position: string;
        let answer: string;
        
        if (pattern.source.includes('\\(')) {
          // For patterns where answer comes first
          answer = match[1].trim();
          position = match[2].trim();
        } else {
          // For patterns where position comes first
          position = match[1].trim();
          answer = match[2].trim();
        }
        
        // Generate a clue based on the answer (since we don't have the actual clue)
        const clue = `Answer for ${position}`;
        
        answers.push({
          clue: clue,
          answer: answer.toUpperCase(),
          position: position.toUpperCase(),
          confidence: 1.0 // Manual answers are 100% confident
        });
        
        break; // Found a match, move to next line
      }
    }
  }
  
  return answers;
}

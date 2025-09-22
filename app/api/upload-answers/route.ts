import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';
import { requireUploadAuth } from '@/lib/auth';
import { addAnswerData, getAnswersData } from '@/lib/memory-store';

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = requireUploadAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const { text, date } = await request.json();
  
  console.log('📝 Received text:', JSON.stringify(text));
  console.log('📝 Text length:', text?.length);
  console.log('📝 Text trimmed length:', text?.trim()?.length);

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

    const selectedDate = date || new Date().toISOString().split('T')[0];
    const answersData = {
      date: selectedDate,
      answers: answers,
      source: 'manual_answers_upload',
      uploaded_at: new Date().toISOString(),
      total_answers: answers.length,
      high_confidence: answers.filter((a: any) => a.confidence > 0.8).length
    };

    // Try file system first (development)
    try {
      const dataPath = join(process.cwd(), 'data', 'answers.json');
      let allAnswers: Record<string, any> = {};
      try {
        const existingData = fs.readFileSync(dataPath, 'utf8');
        allAnswers = JSON.parse(existingData);
      } catch (error) {
        console.log('No existing answers.json found or file is empty, starting fresh.');
      }
      
      allAnswers[selectedDate] = answersData;
      fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
      console.log(`💾 Manual answers saved to file system for ${selectedDate}`);
    } catch (error) {
      // Fallback to memory store (production)
      console.log('File system not available, using memory store');
      addAnswerData(selectedDate, answersData);
      console.log(`💾 Manual answers saved to memory store for ${selectedDate}`);
    }
    
    console.log(`💾 Manual answers saved for ${selectedDate}`);
    console.log(`📄 Generated ${answers.length} individual answer pages`);

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: selectedDate,
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
    // Skip empty lines and section headers
    if (!line || line === 'Across' || line === 'Down') {
      continue;
    }
    
    // Handle bullet point format: • Clue text (1A): ANSWER
    const bulletMatch = line.match(/•\s*(.+?)\s*\((\d+[AD])\):\s*(.+)$/i);
    if (bulletMatch) {
      const clue = bulletMatch[1].trim();
      const position = bulletMatch[2].trim();
      const answer = bulletMatch[3].trim();
      
      answers.push({
        clue: clue,
        answer: answer.toUpperCase(),
        position: position.toUpperCase(),
        confidence: 1.0
      });
      continue;
    }
    
    // Try other formats as fallback
    const patterns = [
      // Format: Clue text, 1A, ANSWER
      /^(.+?),\s*(\d+[AD]),\s*(.+)$/i,
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
        let clue: string;
        
        if (pattern.source.includes(',\\s*\\d+[AD],')) {
          // For format: Clue text, 1A, ANSWER
          clue = match[1].trim();
          position = match[2].trim();
          answer = match[3].trim();
        } else if (pattern.source.includes('\\(')) {
          // For patterns where answer comes first
          answer = match[1].trim();
          position = match[2].trim();
          clue = `Answer for ${position}`;
        } else {
          // For patterns where position comes first
          position = match[1].trim();
          answer = match[2].trim();
          clue = `Answer for ${position}`;
        }
        
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

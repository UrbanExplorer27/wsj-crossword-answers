import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Save the uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `crossword-${today}.pdf`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    
    // Ensure uploads directory exists
    await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });
    
    // Save file
    await writeFile(filepath, buffer);
    
    console.log(`📁 PDF saved: ${filepath}`);

    // Process with OpenAI
    console.log('🤖 Processing PDF with OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a crossword puzzle expert. Analyze this WSJ (Wall Street Journal) crossword puzzle PDF and extract ALL visible answers with their clues.

IMPORTANT: Look carefully for:
1. Clue numbers and letters (like "1A", "2D", "3A", etc.) - these are usually in small text
2. The actual answer words filled in the crossword grid
3. Any clue text that's visible in the interface

The WSJ crossword typically has:
- Across clues (A) and Down clues (D)
- Numbers like 1, 2, 3, etc. next to clues
- Answer words in the grid squares
- Clue text in a sidebar or below the grid

Extract EVERYTHING you can see, even if partially visible. Be thorough!

Return a JSON array with this exact format:
[
  {
    "clue": "The clue text as shown",
    "answer": "THEANSWER",
    "position": "1A",
    "confidence": 0.95
  }
]

Rules:
- Look for BOTH across (A) and down (D) clues
- Extract as many as possible, even if confidence is low
- If you see any text that looks like clues or answers, include it
- Use the exact clue text as shown
- Position should be in format like "1A", "2D", etc.
- Confidence should be 0.0-1.0 based on clarity
- Return empty array ONLY if you see absolutely no crossword content`
            },
            {
              type: "text",
              text: "Please analyze this crossword puzzle PDF and extract all the answers with their clues."
            }
          ]
        }
      ],
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    console.log('📝 OpenAI response:', content);

    let answers = [];
    try {
      // Try to parse JSON from the response
      const jsonMatch = content?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        answers = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }

    // Save answers to data file
    if (answers.length > 0) {
      const answersData = {
        date: today,
        answers: answers,
        source: 'manual_upload',
        uploaded_at: new Date().toISOString(),
        total_answers: answers.length,
        high_confidence: answers.filter((a: any) => a.confidence > 0.8).length
      };

      // Save to answers.json
      const dataPath = join(process.cwd(), 'data', 'answers.json');
      const fs = require('fs');
      
      let allAnswers = {};
      try {
        const existingData = fs.readFileSync(dataPath, 'utf8');
        allAnswers = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, start fresh
      }
      
      allAnswers[today] = answersData;
      fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
      
      console.log(`💾 Answers saved for ${today}`);
    }

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: today,
      filename: filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process crossword' },
      { status: 500 }
    );
  }
}

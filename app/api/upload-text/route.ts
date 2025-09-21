import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('📝 Processing text with OpenAI...');

    // Send text to OpenAI for crossword extraction
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: `You are a crossword puzzle expert. Analyze this crossword puzzle text and extract ALL answers with their clues.

IMPORTANT: Look carefully for:
1. Clue numbers and letters (like "1A", "2D", "3A", etc.)
2. The actual answer words
3. Any clue text that's visible

The crossword typically has:
- Across clues (A) and Down clues (D)
- Numbers like 1, 2, 3, etc. next to clues
- Answer words in the grid or listed separately
- Clue text in various formats

Extract EVERYTHING you can find, even if partially visible. Be thorough!

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
- Return empty array ONLY if you see absolutely no crossword content

Here's the text to analyze:
${text}`
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
      console.error('Error parsing JSON from OpenAI response:', error);
    }

    // Save answers to data file
    if (answers.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const answersData = {
        date: today,
        answers: answers,
        source: 'text_upload',
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
        console.log('No existing answers.json found or file is empty, starting fresh.');
      }
      
      allAnswers[today] = answersData;
      fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
      
      console.log(`💾 Answers saved for ${today}`);
    }

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: new Date().toISOString().split('T')[0],
      method: 'text_upload'
    });

  } catch (error) {
    console.error('Text upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process text. Please try again.' 
    }, { status: 500 });
  }
}

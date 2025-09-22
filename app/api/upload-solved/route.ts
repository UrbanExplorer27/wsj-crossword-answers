import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';
import fs from 'fs';
import { requireUploadAuth } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = requireUploadAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const date = formData.get('date') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString('base64');
  const selectedDate = date || new Date().toISOString().split('T')[0];
  const filename = `solved-crossword-${selectedDate}-${Date.now()}.${file.type.split('/')[1]}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);
  console.log(`📁 Solved crossword image saved: ${filepath}`);

  let answers = [];
  let method = 'solved_vision_api';

  try {
    console.log('🤖 Processing solved crossword with OpenAI Vision (GPT-5)...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5", // Using GPT-5 for Vision
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a crossword puzzle expert. Analyze this solved WSJ (Wall Street Journal) crossword puzzle image and extract ALL answers with their clues.

IMPORTANT: This is a SOLVED crossword puzzle, so you can see:
1. The completed crossword grid with all answers filled in
2. The clue list (usually on the side or below the grid)
3. Both Across (A) and Down (D) clues with their corresponding answers

Your task is to:
1. Read the clue numbers and letters (like "1A", "2D", "3A", etc.)
2. Read the actual clue text for each position
3. Read the corresponding answer from the filled grid
4. Match each clue with its answer

Extract EVERYTHING you can see. Be thorough and accurate!

Return a JSON array with this exact format:
[
  {
    "clue": "The exact clue text as shown",
    "answer": "THEANSWER",
    "position": "1A",
    "confidence": 0.95
  }
]

Rules:
- Look for BOTH across (A) and down (D) clues
- Extract as many as possible, even if confidence is low
- Use the exact clue text as shown in the image
- Position should be in format like "1A", "2D", etc.
- Answer should be the word(s) filled in the grid
- Confidence should be 0.0-1.0 based on clarity
- Return empty array ONLY if you see absolutely no crossword content

This is a solved puzzle, so you should be able to see both clues and answers clearly!`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${file.type.split('/')[1]};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    console.log('📝 OpenAI response:', content);

    try {
      const jsonMatch = content?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        answers = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing JSON from Vision API response:', error);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error during solved crossword processing or Vision API call:', error);
    return NextResponse.json({ error: `Solved crossword processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }

  if (answers.length > 0) {
    const answersData = {
      date: selectedDate,
      answers: answers,
      source: 'solved_crossword_vision',
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
    
    allAnswers[selectedDate] = answersData;
    fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
    
    console.log(`💾 Solved crossword answers saved for ${selectedDate}`);
    console.log(`📄 Generated ${answers.length} individual answer pages`);
  }

  return NextResponse.json({
    success: true,
    answers: answers,
    total: answers.length,
    date: selectedDate,
    filename: filename,
    method: method
  });
}

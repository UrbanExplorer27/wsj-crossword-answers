import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';
import { fromPath } from 'pdf2pic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const date = formData.get('date') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const selectedDate = date || new Date().toISOString().split('T')[0];
  const filename = `crossword-${selectedDate}.pdf`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);

  // Save file
  await writeFile(filepath, buffer);
  console.log(`📁 PDF saved: ${filepath}`);

  try {
    // Convert PDF to images
    console.log('🖼️ Converting PDF to images...');
    const convert = fromPath(filepath, {
      density: 300,
      saveFilename: `crossword-${today}`,
      savePath: join(process.cwd(), 'public', 'uploads'),
      format: 'png',
      width: 2000,
      height: 2000
    });

    const results = await convert.bulk(-1, { responseType: 'base64' });
    console.log(`📸 Converted ${results.length} pages to images`);

    // Send to GPT-5 Vision
    console.log('🤖 Processing with GPT-5 Vision...');
    const imageContents = results.map((result) => ({
      type: "image_url" as const,
      image_url: {
        url: `data:image/png;base64,${result.base64}`
      }
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract crossword answers from this image. Return JSON array:
[
  {
    "clue": "clue text",
    "answer": "ANSWER",
    "position": "1A",
    "confidence": 0.95
  }
]`
            },
            ...imageContents
          ]
        }
      ],
          max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    console.log('📝 GPT-5 response:', content);

    let answers = [];
    try {
      const jsonMatch = content?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        answers = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }

    // Save answers
    if (answers.length > 0) {
      const answersData = {
        date: selectedDate,
        answers: answers,
        source: 'gpt5_vision',
        uploaded_at: new Date().toISOString(),
        total_answers: answers.length,
        high_confidence: answers.filter((a: any) => a.confidence > 0.8).length
      };

      const dataPath = join(process.cwd(), 'data', 'answers.json');
      const fs = require('fs');

      let allAnswers: Record<string, any> = {};
      try {
        const existingData = fs.readFileSync(dataPath, 'utf8');
        allAnswers = JSON.parse(existingData);
      } catch (error) {
        console.log('No existing answers.json found, starting fresh.');
      }
      
      allAnswers[selectedDate] = answersData;
      fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
      
      console.log(`💾 Answers saved for ${selectedDate}`);
    }

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: selectedDate,
      method: 'gpt5_vision'
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF. Please try again.' 
    }, { status: 500 });
  }
}
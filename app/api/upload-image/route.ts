import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const today = new Date().toISOString().split('T')[0];
  const filename = `crossword-${today}.${file.type.split('/')[1]}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);

  // Save file
  await writeFile(filepath, buffer);
  console.log(`📁 Image saved: ${filepath}`);

  try {
    // Convert to base64
    const base64Image = buffer.toString('base64');
    
    // Send to GPT-5 Vision
    console.log('🤖 Processing with GPT-5 Vision...');
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
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`
              }
            }
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
        date: today,
        answers: answers,
        source: 'gpt5_vision_image',
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
      
      allAnswers[today] = answersData;
      fs.writeFileSync(dataPath, JSON.stringify(allAnswers, null, 2));
      
      console.log(`💾 Answers saved for ${today}`);
      console.log(`📄 Generated ${answers.length} individual answer pages`);
    }

    return NextResponse.json({
      success: true,
      answers: answers,
      total: answers.length,
      date: today,
      method: 'gpt5_vision_image'
    });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process image. Please try again.' 
    }, { status: 500 });
  }
}

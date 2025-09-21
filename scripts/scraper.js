const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WSJ_CROSSWORD_URL = process.env.WSJ_CROSSWORD_URL || 'https://www.wsj.com/puzzles/crossword';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function takeScreenshot() {
  console.log('🚀 Starting WSJ crossword scraping...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('📱 Navigating to WSJ crossword...');
    await page.goto(WSJ_CROSSWORD_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for crossword to load
    console.log('⏳ Waiting for crossword to load...');
    await page.waitForTimeout(5000);
    
    // Try to find and click "Show Answers" or similar button
    try {
      const showAnswersButton = await page.locator('button:has-text("Show Answers"), button:has-text("Reveal"), button:has-text("Solution")').first();
      if (await showAnswersButton.isVisible()) {
        console.log('🔍 Clicking "Show Answers" button...');
        await showAnswersButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('ℹ️  No "Show Answers" button found, proceeding with current view');
    }
    
    // Take full page screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
    });
    
    const today = new Date().toISOString().split('T')[0];
    const screenshotPath = path.join(process.cwd(), 'public', 'screenshots', `${today}.png`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await fs.writeFile(screenshotPath, screenshot);
    
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
    
  } finally {
    await browser.close();
  }
}

async function extractAnswersWithOpenAI(imagePath) {
  console.log('🤖 Extracting answers with OpenAI...');
  
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = process.env.CUSTOM_PROMPT || `
    Analyze this WSJ crossword puzzle screenshot and extract all the answers.
    
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
    - Only include answers that are clearly visible
    - Use the exact clue text as shown
    - Position should be in format like "1A", "2D", etc.
    - Confidence should be 0.0-1.0 based on clarity
    - Return empty array if no answers are visible
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });
    
    const content = response.choices[0].message.content;
    console.log('📝 OpenAI response:', content);
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const answers = JSON.parse(jsonMatch[0]);
      console.log(`✅ Extracted ${answers.length} answers`);
      return answers;
    } else {
      console.log('⚠️  Could not parse JSON from OpenAI response');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error extracting answers:', error.message);
    return [];
  }
}

async function saveAnswers(answers) {
  const today = new Date().toISOString().split('T')[0];
  const answersPath = path.join(process.cwd(), 'data', 'answers.json');
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(answersPath), { recursive: true });
  
  let allAnswers = {};
  try {
    const existingData = await fs.readFile(answersPath, 'utf8');
    allAnswers = JSON.parse(existingData);
  } catch (error) {
    console.log('📝 Creating new answers file');
  }
  
  allAnswers[today] = {
    date: today,
    answers: answers,
    scrapedAt: new Date().toISOString(),
    source: 'WSJ',
    totalAnswers: answers.length
  };
  
  await fs.writeFile(answersPath, JSON.stringify(allAnswers, null, 2));
  console.log(`💾 Answers saved for ${today}`);
}

async function main() {
  try {
    const screenshotPath = await takeScreenshot();
    const answers = await extractAnswersWithOpenAI(screenshotPath);
    await saveAnswers(answers);
    
    console.log('🎉 Scraping completed successfully!');
    console.log(`📊 Found ${answers.length} answers`);
    
    if (answers.length === 0) {
      console.log('⚠️  No answers found - you may need to manually check the screenshot');
    }
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { takeScreenshot, extractAnswersWithOpenAI, saveAnswers };

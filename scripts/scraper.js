const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WSJ_PUZZLES_URL = process.env.WSJ_PUZZLES_URL || 'https://www.wsj.com/news/puzzle?gaa_at=eafs&gaa_n=ASWzDAigbgREeawx-fWIpGXzkXT4vpgpOgI2lsKQLeb79mVGtSQzPzlFywj2zza9w1k%3D&gaa_ts=68cf9fba&gaa_sig=wqPxu5zsWOioaXkDkt4NlQgz3etXUrY4nsfVSCFW6rBheucoK7FyZVHisJ9x1GKJO5yn-bnZfUnGhFl7pEqGfg%3D%3D';

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
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });
    
    const page = await context.newPage();
    
    console.log('📱 Navigating to WSJ puzzles page...');
    await page.goto(WSJ_PUZZLES_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for puzzles to load
    console.log('⏳ Waiting for puzzles to load...');
    await page.waitForTimeout(5000);
    
    // Find the first crossword link (today's crossword)
    console.log('🔍 Looking for today\'s crossword...');
    const crosswordLink = await page.locator('a[href*="crossword"]').first();
    
    if (await crosswordLink.count() === 0) {
      throw new Error('No crossword link found on puzzles page');
    }
    
    const crosswordUrl = await crosswordLink.getAttribute('href');
    console.log(`📋 Found crossword: ${crosswordUrl}`);
    
    // Navigate to the crossword page
    console.log('📱 Navigating to crossword page...');
    await page.goto(crosswordUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for crossword to load
    console.log('⏳ Waiting for crossword to load...');
    await page.waitForTimeout(5000);
    
    // Debug: Check what we can see on the page
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Check if there's a paywall or login requirement
    const paywallText = await page.locator('text=Subscribe, text=Sign In, text=Log In, text=Subscribe to continue').first();
    if (await paywallText.count() > 0) {
      console.log('🔒 Paywall detected - subscription required');
    }
    
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
    You are a crossword puzzle expert. Analyze this WSJ (Wall Street Journal) crossword puzzle screenshot and extract ALL visible answers with their clues.
    
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
    - Return empty array ONLY if you see absolutely no crossword content
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

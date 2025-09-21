const { takeScreenshot, extractAnswersWithOpenAI, saveAnswers } = require('./scraper');

async function testScraper() {
  console.log('🧪 Testing WSJ crossword scraper...');
  
  try {
    // Test screenshot
    console.log('\n1. Testing screenshot...');
    const screenshotPath = await takeScreenshot();
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    
    // Test OpenAI extraction (only if you have API key)
    if (process.env.OPENAI_API_KEY) {
      console.log('\n2. Testing OpenAI extraction...');
      const answers = await extractAnswersWithOpenAI(screenshotPath);
      console.log(`✅ Extracted ${answers.length} answers:`, answers);
      
      // Test saving
      console.log('\n3. Testing save...');
      await saveAnswers(answers);
      console.log('✅ Answers saved successfully');
    } else {
      console.log('\n⚠️  Skipping OpenAI test - no API key found');
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testScraper();

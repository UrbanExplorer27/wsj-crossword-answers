# WSJ Crossword Answers

Automated daily scraping and publishing of Wall Street Journal crossword answers with SEO optimization.

## Features

- 🤖 **Automated Scraping**: Daily Playwright-based screenshot capture
- 🧠 **AI Answer Extraction**: OpenAI GPT-4 Vision for answer recognition
- 📱 **Responsive Design**: Mobile-first Next.js interface
- 🔍 **SEO Optimized**: Rich metadata and structured data
- 📊 **Archive System**: Browse all previous answers
- ⚡ **Fast Loading**: Optimized images and caching

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Scraping**: Playwright (headless Chromium)
- **AI**: OpenAI GPT-4 Vision API
- **Scheduling**: GitHub Actions (daily cron)
- **Storage**: JSON files (simple, no database needed)
- **Hosting**: Vercel/Netlify

## Quick Start

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd wsj-crossword-answers
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your OpenAI API key
   ```

3. **Install Playwright**:
   ```bash
   npx playwright install chromium
   ```

4. **Test the scraper**:
   ```bash
   npm run test-scraper
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create `.env.local` with:

```env
OPENAI_API_KEY=your_openai_api_key_here
WSJ_CROSSWORD_URL=https://www.wsj.com/puzzles/crossword
CUSTOM_PROMPT=Your custom prompt for better extraction
```

### GitHub Actions Setup

1. Add these secrets to your GitHub repository:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `WSJ_CROSSWORD_URL`: WSJ crossword URL (optional)
   - `VERCEL_TOKEN`: If using Vercel for deployment
   - `VERCEL_ORG_ID`: Vercel organization ID
   - `VERCEL_PROJECT_ID`: Vercel project ID

2. The workflow runs daily at 6 AM EST (11 AM UTC)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── [date]/            # Dynamic date pages
│   ├── archive/           # Archive page
│   ├── api/scrape/        # API endpoint for manual scraping
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   └── data.ts           # Data access functions
├── scripts/              # Scraping scripts
│   ├── scraper.js        # Main scraper
│   └── test-scraper.js   # Test script
├── data/                 # JSON data storage
│   └── answers.json      # All scraped answers
├── public/               # Static assets
│   └── screenshots/      # Screenshot storage
└── .github/workflows/    # GitHub Actions
    └── daily-scrape.yml  # Daily automation
```

## Usage

### Manual Scraping

```bash
# Run scraper manually
npm run scrape

# Test scraper (screenshot only)
npm run test-scraper
```

### API Endpoints

- `POST /api/scrape` - Trigger manual scraping
- `GET /api/scrape` - API information

### Pages

- `/` - Today's answers
- `/[date]` - Specific date answers (YYYY-MM-DD)
- `/archive` - Browse all previous answers

## SEO Features

- **Meta Tags**: Optimized title, description, keywords
- **Open Graph**: Social media sharing
- **Structured Data**: Rich snippets for search engines
- **Sitemap**: Automatic sitemap generation
- **Mobile-First**: Responsive design
- **Fast Loading**: Optimized images and caching

## Legal Considerations

⚠️ **Important**: This tool is for educational purposes. Ensure compliance with:
- WSJ's Terms of Service
- Copyright laws
- Robots.txt compliance
- Rate limiting and respectful scraping

## Troubleshooting

### Common Issues

1. **No answers extracted**:
   - Check if WSJ page structure changed
   - Verify OpenAI API key is valid
   - Check screenshot quality

2. **Scraping fails**:
   - Ensure Playwright is installed
   - Check network connectivity
   - Verify WSJ URL is accessible

3. **Low confidence answers**:
   - Adjust the custom prompt
   - Check screenshot quality
   - Verify crossword is fully loaded

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This project is not affiliated with The Wall Street Journal. Use responsibly and in compliance with all applicable laws and terms of service.

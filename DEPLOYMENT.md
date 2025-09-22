# Netlify Deployment Guide

## Prerequisites
- GitHub repository with the code
- Netlify account
- Domain: crosswordwiki.com

## Deployment Steps

### 1. Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select the repository: `wsj-crossword-answers`

### 2. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 3. Environment Variables
Add these environment variables in Netlify dashboard:

```
OPENAI_API_KEY=your_openai_api_key_here
UPLOAD_PASSWORD=WSJ_Admin_2025_Secure_789!
WSJ_CROSSWORD_URL=https://www.wsj.com/puzzles/crossword
```

### 4. Domain Configuration
1. Go to Site settings > Domain management
2. Add custom domain: `crosswordwiki.com`
3. Configure DNS settings as instructed by Netlify
4. Enable HTTPS (automatic with Netlify)

### 5. Build Configuration
The `netlify.toml` file is already configured with:
- Security headers
- Cache optimization
- Proper content types for sitemap and robots.txt

### 6. Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Test all functionality:
   - Home page loads
   - Search works
   - Upload page requires password
   - All answer pages load
   - Sitemap accessible at /sitemap.xml

## Post-Deployment Checklist

- [ ] Site loads at crosswordwiki.com
- [ ] All pages accessible
- [ ] Search functionality works
- [ ] Upload page password protected
- [ ] Sitemap.xml accessible
- [ ] Robots.txt accessible
- [ ] HTTPS enabled
- [ ] All internal links work
- [ ] Mobile responsive

## Troubleshooting

### Build Issues
- Check Node version is 18
- Verify all environment variables are set
- Check build logs for errors

### API Issues
- Ensure API routes are working
- Check serverless function limits
- Verify environment variables

### Domain Issues
- Check DNS configuration
- Verify SSL certificate
- Test both www and non-www versions



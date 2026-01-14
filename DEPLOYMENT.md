# Deployment Guide

Complete guide for deploying your MCA Syndication Manager to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Netlify Deployment](#netlify-deployment)
3. [Vercel Deployment](#vercel-deployment)
4. [AWS S3 + CloudFront](#aws-s3--cloudfront)
5. [Custom Server](#custom-server)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally
- [ ] Google Sheets integration working
- [ ] Environment variables documented
- [ ] Service account configured (recommended)
- [ ] Production build tested (`npm run build && npm run preview`)
- [ ] Browser console shows no errors
- [ ] Data calculations verified
- [ ] Mobile responsiveness tested
- [ ] API keys restricted by domain

## Netlify Deployment

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

   Follow the prompts:
   - Create & configure a new site
   - Choose your team
   - Site name: `mca-syndication-manager`
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_GOOGLE_SHEETS_API_KEY "your_api_key"
   netlify env:set VITE_GOOGLE_SHEETS_SPREADSHEET_ID "your_spreadsheet_id"
   netlify env:set VITE_GOOGLE_SHEETS_DEALS_TAB "Deals"
   netlify env:set VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB "Payout Events"
   netlify env:set VITE_APP_NAME "OrgMeter"
   netlify env:set VITE_REFRESH_INTERVAL "60000"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Netlify Dashboard

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Show advanced" > "New variable" to add environment variables

3. **Add Environment Variables**
   - `VITE_GOOGLE_SHEETS_API_KEY`
   - `VITE_GOOGLE_SHEETS_SPREADSHEET_ID`
   - `VITE_GOOGLE_SHEETS_DEALS_TAB`
   - `VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB`
   - `VITE_APP_NAME`
   - `VITE_REFRESH_INTERVAL`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Visit your site at `https://your-site-name.netlify.app`

### Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Vercel Deployment

### Method 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow prompts:
   - Set up and deploy? Yes
   - Which scope? Choose your account
   - Link to existing project? No
   - Project name: `mca-syndication-manager`
   - Directory: `./`
   - Override settings? No

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_GOOGLE_SHEETS_API_KEY
   vercel env add VITE_GOOGLE_SHEETS_SPREADSHEET_ID
   # Add all other VITE_* variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Import Project**
   - Go to [Vercel](https://vercel.com/)
   - Click "Add New" > "Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Go to Settings > Environment Variables
   - Add all `VITE_*` variables
   - Choose environment: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Visit your site at `https://your-project.vercel.app`

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## AWS S3 + CloudFront

For enterprise deployment with full control:

### Step 1: Build Application

```bash
npm run build
```

### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://mca-syndication-manager --region us-east-1
```

### Step 3: Configure Bucket for Static Hosting

```bash
aws s3 website s3://mca-syndication-manager \
  --index-document index.html \
  --error-document index.html
```

### Step 4: Upload Build Files

```bash
aws s3 sync dist/ s3://mca-syndication-manager --delete
```

### Step 5: Set Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mca-syndication-manager/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket mca-syndication-manager \
  --policy file://bucket-policy.json
```

### Step 6: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create distribution
3. Origin domain: Select your S3 bucket
4. Default root object: `index.html`
5. Error pages: Custom error response
   - HTTP 403/404 → `/index.html` (200 response)

### Step 7: Environment Variables

Since this is a static site, environment variables are baked in at build time:

```bash
# Create production .env
cat > .env.production << EOF
VITE_GOOGLE_SHEETS_API_KEY=your_production_key
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events
VITE_APP_NAME=OrgMeter
VITE_REFRESH_INTERVAL=60000
EOF

# Build with production variables
npm run build

# Deploy
aws s3 sync dist/ s3://mca-syndication-manager --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Custom Server

### Using Express

1. **Install Dependencies**
   ```bash
   npm install express compression
   ```

2. **Create Server File** (`server.js`):
   ```javascript
   const express = require('express')
   const compression = require('compression')
   const path = require('path')

   const app = express()
   const PORT = process.env.PORT || 3000

   app.use(compression())
   app.use(express.static(path.join(__dirname, 'dist')))

   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'dist', 'index.html'))
   })

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`)
   })
   ```

3. **Update package.json**:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "build": "vite build"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build
   npm start
   ```

### Using Nginx

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Copy to Web Root**
   ```bash
   sudo cp -r dist/* /var/www/html/
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/mca-app`):
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /var/www/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

4. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mca-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Environment Variables

### All Required Variables

```env
# Google Sheets API Configuration
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC-your-api-key
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1abc123def456
VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events

# Application Settings
VITE_APP_NAME=OrgMeter
VITE_REFRESH_INTERVAL=60000
```

### Setting Variables by Platform

**Netlify**:
```bash
netlify env:set VARIABLE_NAME "value"
```

**Vercel**:
```bash
vercel env add VARIABLE_NAME
```

**AWS**:
Build with `.env.production` file before uploading

**Heroku**:
```bash
heroku config:set VARIABLE_NAME=value
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit production URL
- [ ] Check all three pages load (Dashboard, Advances, Ledger)
- [ ] Verify data is loading from Google Sheets
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify refresh functionality works

### 2. Configure Google API Restrictions

1. Go to Google Cloud Console
2. Edit your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your production domain:
     - `https://your-domain.com/*`
     - `https://your-domain.netlify.app/*`
     - `https://your-domain.vercel.app/*`
4. Save

### 3. Set Up Custom Domain (Optional)

**Netlify**:
```bash
netlify domains:add your-domain.com
```
Then configure DNS as instructed.

**Vercel**:
1. Go to project settings
2. Domains > Add
3. Follow DNS configuration steps

### 4. Enable HTTPS

Most platforms enable HTTPS automatically. If not:

**Let's Encrypt** (for custom servers):
```bash
sudo certbot --nginx -d your-domain.com
```

### 5. Monitor Performance

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Enable error tracking (Sentry)
- Monitor Google Sheets API quota usage
- Check site speed (Google PageSpeed Insights)

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_GOOGLE_SHEETS_API_KEY: ${{ secrets.VITE_GOOGLE_SHEETS_API_KEY }}
          VITE_GOOGLE_SHEETS_SPREADSHEET_ID: ${{ secrets.VITE_GOOGLE_SHEETS_SPREADSHEET_ID }}
          VITE_GOOGLE_SHEETS_DEALS_TAB: Deals
          VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB: Payout Events
        run: npm run build

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

Add secrets in GitHub repository settings.

## Troubleshooting

### Build Fails

**Issue**: Build fails with module errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue**: Variables undefined in production

**Solution**:
- Ensure all variables start with `VITE_`
- Rebuild after adding new variables
- Check platform-specific variable syntax

### Blank Page After Deploy

**Issue**: Site loads but shows blank page

**Solution**:
1. Check browser console for errors
2. Verify base URL in `vite.config.js`
3. Check routing configuration
4. Ensure 404 redirects to index.html

### CORS Errors

**Issue**: Google Sheets API blocked by CORS

**Solution**:
- Google Sheets API shouldn't have CORS issues
- If you see errors, check you're using the correct endpoint
- Verify API key restrictions

### Data Not Loading

**Issue**: App loads but no data appears

**Solution**:
1. Check browser console for API errors
2. Verify environment variables are set correctly
3. Test API key in browser:
   ```
   https://sheets.googleapis.com/v4/spreadsheets/YOUR_ID/values/Deals?key=YOUR_KEY
   ```
4. Check Google Sheets is publicly accessible

## Performance Optimization

1. **Enable Compression** (automatic on Netlify/Vercel)
2. **Set Cache Headers** for static assets
3. **Use CDN** for global distribution
4. **Optimize Images** if you add any
5. **Lazy Load** components if needed

## Security Checklist

- [ ] HTTPS enabled
- [ ] API keys restricted by domain
- [ ] Environment variables secured
- [ ] No sensitive data in code
- [ ] Security headers configured
- [ ] Service account permissions minimal
- [ ] Regular dependency updates

---

**Need Help?**

Check:
- [Main README](README.md)
- [Google Sheets Setup Guide](GOOGLE_SHEETS_SETUP.md)
- Platform-specific documentation
- Browser console errors

**Last Updated**: January 2026

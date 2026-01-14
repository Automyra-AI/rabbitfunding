# Troubleshooting Guide

Common issues and solutions for the MCA Syndication Manager.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Google Sheets Issues](#google-sheets-issues)
3. [Data Display Issues](#data-display-issues)
4. [Build and Deploy Issues](#build-and-deploy-issues)
5. [Performance Issues](#performance-issues)
6. [UI/Display Issues](#uidisplay-issues)
7. [Development Issues](#development-issues)

## Installation Issues

### npm install fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Try legacy peer deps
npm install --legacy-peer-deps

# Or force
npm install --force

# Or use npm 7+
npm install
```

### Node version too old

**Error**: `The engine "node" is incompatible with this module`

**Solution**:
```bash
# Check current version
node --version

# Should be 18+
# Download from https://nodejs.org/
```

### Permission errors (Mac/Linux)

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Don't use sudo with npm install
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

## Google Sheets Issues

### "API key not valid"

**Symptoms**: Data not loading, error in console

**Solutions**:

1. **Check API key in .env**
   ```env
   VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC-your-key-here
   # No spaces, no quotes
   ```

2. **Verify API is enabled**
   - Go to Google Cloud Console
   - APIs & Services > Library
   - Search "Google Sheets API"
   - Should show "API enabled"

3. **Check API key restrictions**
   - Go to Credentials
   - Edit your API key
   - Temporarily remove all restrictions to test

4. **Restart dev server after .env changes**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### "Unable to fetch data" / "The caller does not have permission"

**Symptoms**: Error loading Google Sheets data

**Solutions**:

1. **Make sheet publicly accessible**
   - Open Google Sheet
   - Click "Share"
   - Change "Restricted" to "Anyone with the link"
   - Set to "Viewer"

2. **Verify Spreadsheet ID**
   ```
   URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit

   .env: VITE_GOOGLE_SHEETS_SPREADSHEET_ID=[SPREADSHEET_ID]
   ```

3. **Check tab names**
   ```env
   # Must match exactly (case-sensitive)
   VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
   VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events
   ```

### "Unable to parse range"

**Symptoms**: Error reading specific sheet tabs

**Solutions**:

1. **Verify tab exists**
   - Open Google Sheet
   - Check tab names at bottom
   - Update .env to match exactly

2. **Check for special characters**
   - Tab names with special chars need encoding
   - Rename tabs to simple names (no spaces if possible)

3. **Test manually**
   ```
   https://sheets.googleapis.com/v4/spreadsheets/YOUR_ID/values/Deals?key=YOUR_KEY
   ```

### Data not updating

**Symptoms**: Old data showing, not syncing

**Solutions**:

1. **Click refresh button** in navbar

2. **Check auto-refresh interval**
   ```env
   VITE_REFRESH_INTERVAL=60000  # 60 seconds
   ```

3. **Verify data changed in Google Sheets**
   - Open sheet
   - Check last modified time
   - Make test change

4. **Hard refresh browser**
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

5. **Clear browser cache**
   ```
   Chrome: Settings > Privacy > Clear browsing data
   ```

## Data Display Issues

### Numbers showing as $0.00 or NaN

**Symptoms**: All dollar amounts show $0.00

**Solutions**:

1. **Check data format in Google Sheets**
   - Ensure numbers are actual numbers, not text
   - Remove currency symbols from sheet ($$, commas)
   - Should be: `20000` not `$20,000`

2. **Check column names match**
   ```javascript
   // Required columns in Deals sheet:
   Principal Advanced
   Principal Collected
   Fee Collected
   ```

3. **Verify data types**
   - Console log the raw data:
   ```javascript
   console.log('Deals:', deals)
   ```

### Calculations incorrect

**Symptoms**: Stats don't match expected values

**Solutions**:

1. **Verify calculation logic** in `utils/calculations.js`

2. **Check for missing data**
   - Ensure all deals have required fields
   - Check for null/undefined values

3. **Test with sample data**
   ```javascript
   // In browser console
   const testDeals = [{
     principal_advanced: '10000',
     fee_collected: '1000',
     principal_collected: '5000'
   }]
   console.log(calculateStats(testDeals, []))
   ```

### Missing transactions in Ledger

**Symptoms**: Some transactions don't appear

**Solutions**:

1. **Check Payout Events sheet**
   - Verify all transactions are present
   - Check column names match

2. **Verify date formats**
   - Ensure dates are parseable
   - Format: "JAN 12, 2026 02:01PM" or "2026-01-13"

3. **Check filters**
   - Date range filter might be hiding some
   - Try "All Time" filter

## Build and Deploy Issues

### Build fails with module errors

**Error**: `Could not resolve module`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Try build again
npm run build
```

### Environment variables not working in production

**Symptoms**: App works locally but not in production

**Solutions**:

1. **Verify variables in hosting platform**
   - Netlify: Site Settings > Environment Variables
   - Vercel: Project Settings > Environment Variables
   - All must start with `VITE_`

2. **Rebuild after adding variables**
   - Variables are baked in at build time
   - Must rebuild after changes

3. **Check variable names**
   ```env
   # Must start with VITE_
   VITE_GOOGLE_SHEETS_API_KEY=...  ✅
   GOOGLE_SHEETS_API_KEY=...       ❌
   ```

### Blank page after deploy

**Symptoms**: Production site loads blank white page

**Solutions**:

1. **Check browser console** (F12)
   - Look for error messages
   - Check Network tab for 404s

2. **Verify base URL**
   ```javascript
   // vite.config.js
   export default defineConfig({
     base: '/',  // Should be '/' for most deployments
   })
   ```

3. **Check routing configuration**
   - Ensure platform redirects all routes to index.html
   - Netlify: Add `_redirects` file
   - Vercel: Check `vercel.json`

4. **Test production build locally**
   ```bash
   npm run build
   npm run preview
   ```

### 404 errors on refresh

**Symptoms**: Page works on first load, 404 on refresh

**Solution**:

**Netlify** - Create `public/_redirects`:
```
/*    /index.html   200
```

**Vercel** - Check `vercel.json` has:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Nginx** - Config should have:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Performance Issues

### Slow loading

**Symptoms**: App takes >5 seconds to load

**Solutions**:

1. **Check network tab**
   - See what's taking long
   - Google Sheets API should be <1s

2. **Reduce refresh interval**
   ```env
   VITE_REFRESH_INTERVAL=120000  # 2 minutes instead of 1
   ```

3. **Optimize images** (if you added any)
   - Compress images
   - Use WebP format
   - Lazy load

4. **Check data size**
   - Too many deals? (>1000)
   - Consider pagination on server side

### High memory usage

**Symptoms**: Browser tab using lots of RAM

**Solutions**:

1. **Limit data loaded**
   - Paginate earlier (fewer items per page)
   - Don't load all payout events at once

2. **Clear interval on unmount**
   ```javascript
   useEffect(() => {
     const interval = setInterval(fetchData, 60000)
     return () => clearInterval(interval)  // Important!
   }, [])
   ```

3. **Memoize calculations**
   - Already done with `useMemo`
   - Check for unnecessary re-renders

## UI/Display Issues

### Styling broken / Tailwind not working

**Symptoms**: No styles applied, plain HTML

**Solutions**:

1. **Check Tailwind is imported**
   ```javascript
   // src/main.jsx or src/index.css
   import './index.css'
   ```

2. **Verify index.css has Tailwind**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **Rebuild**
   ```bash
   npm run dev
   ```

4. **Check content paths** in `tailwind.config.js`
   ```javascript
   content: [
     "./index.html",
     "./src/**/*.{js,jsx}",  // Should match your files
   ]
   ```

### Mobile layout broken

**Symptoms**: Looks bad on mobile

**Solutions**:

1. **Check responsive classes**
   ```javascript
   // Use responsive breakpoints
   className="grid grid-cols-1 lg:grid-cols-2"
   ```

2. **Test in mobile view**
   - Chrome DevTools (F12)
   - Toggle device toolbar
   - Test different sizes

3. **Add viewport meta tag** (should already be in index.html)
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

### Icons not showing

**Symptoms**: Missing icons, broken squares

**Solutions**:

1. **Verify lucide-react installed**
   ```bash
   npm install lucide-react
   ```

2. **Check imports**
   ```javascript
   import { Menu, User } from 'lucide-react'
   ```

3. **Rebuild**
   ```bash
   npm run dev
   ```

## Development Issues

### Hot reload not working

**Symptoms**: Changes not showing without manual refresh

**Solutions**:

1. **Restart dev server**
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

2. **Check file is saved**
   - Ensure auto-save is on in editor

3. **Check file path**
   - Must be inside `src/` directory

### Console warnings about keys

**Warning**: `Warning: Each child in a list should have a unique "key" prop`

**Solution**:
```javascript
// ❌ Bad
{deals.map(deal => (
  <div>{deal.name}</div>
))}

// ✅ Good
{deals.map((deal, index) => (
  <div key={deal.id || index}>{deal.name}</div>
))}
```

### ESLint errors

**Error**: Various linting errors

**Solutions**:

1. **Run linter**
   ```bash
   npm run lint
   ```

2. **Fix auto-fixable issues**
   ```bash
   npm run lint -- --fix
   ```

3. **Disable specific rules** (if necessary)
   ```javascript
   /* eslint-disable-next-line rule-name */
   ```

## Getting More Help

### Debugging Steps

1. **Check browser console** (F12)
   - Look for red errors
   - Check warnings

2. **Check Network tab**
   - See if API calls are failing
   - Check response data

3. **Test with mock data**
   - Comment out Google Sheets API
   - Use mock data to isolate issue

4. **Simplify to minimal example**
   - Comment out code until it works
   - Add back piece by piece

### Useful Commands

```bash
# Check versions
node --version
npm --version

# Clean everything
rm -rf node_modules package-lock.json
npm install

# Test production build
npm run build
npm run preview

# Check for updates
npm outdated

# Audit security
npm audit
```

### Testing Google Sheets API Manually

Open this URL in browser (replace values):
```
https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Deals?key=YOUR_API_KEY
```

Should return JSON with your data. If not:
- Check spreadsheet ID
- Check API key
- Check sheet is public
- Check tab name

### Still Stuck?

1. Check [README.md](README.md) for detailed setup
2. Review [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
3. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deploy issues
4. Look at example code in `src/`
5. Create an issue in repository (if applicable)

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| "API key not valid" | Wrong/missing API key | Check .env file |
| "Permission denied" | Sheet not shared | Make sheet public |
| "Module not found" | Missing dependency | `npm install` |
| "Cannot read property" | Data structure mismatch | Check column names |
| "CORS error" | Wrong API endpoint | Use correct Sheets API URL |
| "Blank page" | Build/routing issue | Check console, test locally |

## Prevention Tips

1. **Always use .env for credentials** - Never commit API keys
2. **Test locally before deploying** - Run `npm run build && npm run preview`
3. **Keep dependencies updated** - Run `npm update` monthly
4. **Check console regularly** - Fix warnings before they become errors
5. **Use version control** - Commit working code frequently
6. **Document changes** - Update README when adding features

---

**Last Updated**: January 2026

If you've found a solution not listed here, consider contributing it to help others!

# Google Sheets Integration Guide

Complete guide for connecting your MCA Syndication Manager to Google Sheets.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Option 1: API Key Setup (Development)](#option-1-api-key-setup)
3. [Option 2: Service Account (Production)](#option-2-service-account-production)
4. [Sheet Structure Requirements](#sheet-structure-requirements)
5. [Testing Your Connection](#testing-your-connection)
6. [Troubleshooting](#troubleshooting)

## Quick Start

The fastest way to get started:

1. Get your Google Sheets Spreadsheet ID
2. Create a Google Cloud API Key
3. Make your sheet publicly viewable
4. Add credentials to `.env`
5. Start the app

## Option 1: API Key Setup

Best for: Development, testing, demos

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" > "New Project"
3. Name it "MCA Syndication Manager"
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it, then click "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. Click "Edit API key" (pencil icon)
5. Under "API restrictions":
   - Select "Restrict key"
   - Check "Google Sheets API"
6. Under "Application restrictions" (optional for dev):
   - Select "HTTP referrers"
   - Add: `http://localhost:3000/*`
7. Click "Save"

### Step 4: Get Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. Copy the `SPREADSHEET_ID` part

### Step 5: Share Your Sheet

1. Click the "Share" button in Google Sheets
2. Change "Restricted" to "Anyone with the link"
3. Make sure it's set to "Viewer" (not "Editor")
4. Click "Done"

### Step 6: Configure .env

Create or edit your `.env` file:

```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC-your-api-key-here
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1abc123def456ghi789jkl
VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events
```

## Option 2: Service Account (Production)

Best for: Production deployments, scheduled access, private sheets

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "Service Account"
4. Fill in:
   - **Name**: MCA Syndication Reader
   - **Description**: Read-only access to MCA data
5. Click "Create and Continue"
6. Skip granting access (click "Continue")
7. Click "Done"

### Step 2: Create Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON"
5. Click "Create"
6. Save the downloaded JSON file securely
7. Rename it to `service-account-key.json`
8. Place it in your project root (it's in .gitignore)

### Step 3: Share Sheet with Service Account

1. Open your Google Sheet
2. Click "Share"
3. Paste the service account email (found in the JSON file, looks like):
   ```
   mca-syndication-reader@your-project.iam.gserviceaccount.com
   ```
4. Set permission to "Viewer"
5. Click "Send"

### Step 4: Update Application Code

If using a service account, you'll need to update the Google Sheets service. Create a new file:

**src/services/googleSheetsAuth.js**:

```javascript
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

export const getAuthClient = () => {
  const credentials = JSON.parse(
    import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
  )

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })

  return auth
}

export const getSheetsClient = async () => {
  const auth = await getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })
  return sheets
}
```

Then update **src/services/googleSheets.js** to use the authenticated client.

### Step 5: Configure Environment

For development, you can convert the JSON to a string:

```env
VITE_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

For production (Netlify, Vercel), add the entire JSON content as an environment variable.

## Sheet Structure Requirements

### Deals Tab

Your "Deals" sheet must have these columns (order doesn't matter):

| Column Name | Type | Required | Example |
|-------------|------|----------|---------|
| QBO Customer ID | Text | Yes | "589" |
| QBO Customer Name | Text | Yes | "CENTRAL TEXAS COMMERCIAL BUILDERS" |
| Principal Advanced | Number | Yes | 20000 |
| Actum Merchant ID | Text | Yes | "dODSEr1MhHjr2OAr7aL74fh8hb.t.UtN" |
| Principal Collected | Number | Yes | 3900 |
| Status | Text | Yes | "Active" or "Closed" |
| Fee Collected | Number | Yes | 1200 |
| Last Payment Date | Date/Text | No | "JAN 12, 2026 02:01PM" |
| Last Payment Amount | Number | No | 300 |
| Updated Date | Date/Text | No | "2026-01-13 05:01:02" |
| Factor Rate | Number | No | 1.25 |
| Syndication Percentage | Number | No | 100 |
| Type | Text | No | "New" or "Renewal" |
| Date Funded | Date/Text | No | "2025-11-15" |

### Payout Events Tab

Your "Payout Events" sheet must have these columns:

| Column Name | Type | Required | Example |
|-------------|------|----------|---------|
| History KeyID | Text | Yes | "135859508" |
| Order ID | Text | Yes | "39115813" |
| Client Name | Text | Yes | "CENTRAL TEXAS COMMERCIAL BUILDERS" |
| Amount | Number | Yes | 300 |
| Principal Applied | Number | Yes | 300 |
| Fee Applied | Number | Yes | 0 |
| Transaction Date | Date/Text | Yes | "JAN 12, 2026 02:01PM" |
| Processed Date | Date/Text | No | "2026-01-13 05:01:02" |
| Match Method | Text | No | "actum_merchant_id" |

### Example Sheet Setup

1. **Create a new Google Sheet** or use your existing one
2. **Create two tabs**: "Deals" and "Payout Events"
3. **Add headers** as the first row (exactly as shown above)
4. **Add your data** starting from row 2

Example Deals row:
```
589 | CENTRAL TEXAS COMMERCIAL BUILDERS | 20000 | dODSEr1MhHjr2OAr7aL74fh8hb.t.UtN | 3900 | Active | 1200 | JAN 12, 2026 02:01PM | 300 | 2026-01-13 05:01:02 | 1.25 | 100 | New | 2025-11-15
```

Example Payout Events row:
```
135859508 | 39115813 | CENTRAL TEXAS COMMERCIAL BUILDERS | 300 | 300 | 0 | JAN 12, 2026 02:01PM | 2026-01-13 05:01:02 | actum_merchant_id
```

## Testing Your Connection

### 1. Test in Browser

Open your browser console and run:

```javascript
// Test API Key
const API_KEY = 'YOUR_API_KEY'
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'
const RANGE = 'Deals'

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

If successful, you'll see your sheet data.

### 2. Test in Application

1. Start your app: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Check the browser console for any errors
4. If you see data loading, it's working!

### 3. Verify Data

Check that:
- Dashboard shows correct totals
- Advances page displays all deals
- Ledger shows transactions
- Last updated timestamp is recent

## Troubleshooting

### Error: "API key not valid"

**Cause**: Invalid or misconfigured API key

**Solutions**:
1. Verify the API key in `.env` is correct
2. Check that Google Sheets API is enabled in Google Cloud
3. Ensure there are no extra spaces in the API key
4. Try regenerating the API key

### Error: "The caller does not have permission"

**Cause**: Sheet is not shared or API restrictions are too strict

**Solutions**:
1. Make sure the sheet is shared "Anyone with the link"
2. Verify permission is set to "Viewer"
3. If using HTTP referrer restrictions, add your domain
4. Try removing all API restrictions temporarily

### Error: "Unable to parse range"

**Cause**: Tab name doesn't match configuration

**Solutions**:
1. Check `.env` for correct tab names
2. Ensure tab names match exactly (case-sensitive)
3. Check for extra spaces in tab names

### Data Not Updating

**Cause**: Caching or stale data

**Solutions**:
1. Click the refresh button in the navbar
2. Hard refresh browser (Ctrl+Shift+R)
3. Check that n8n automation is running
4. Verify data is actually changing in Google Sheets

### CORS Errors

**Cause**: Browser blocking API requests

**Solutions**:
1. This shouldn't happen with Google Sheets API
2. If you see CORS errors, you might be using the wrong endpoint
3. Make sure you're using the public API endpoint shown above

### Service Account Not Working

**Cause**: Permission or configuration issues

**Solutions**:
1. Verify service account email is shared on the sheet
2. Check JSON key file is valid
3. Ensure credentials are properly loaded in code
4. Verify SCOPES include readonly access

## Advanced Configuration

### Custom Column Mapping

If your Google Sheet has different column names, update the mapping in **src/services/googleSheets.js**:

```javascript
const headers = rows[0].map(h => {
  // Custom mapping
  if (h === 'Your Column Name') return 'principal_advanced'
  return h.toLowerCase().replace(/\s+/g, '_')
})
```

### Multiple Spreadsheets

To pull from multiple sheets:

1. Add additional environment variables:
   ```env
   VITE_GOOGLE_SHEETS_SPREADSHEET_ID_2=...
   ```

2. Modify `fetchDealsData()` to fetch from multiple sources

### Rate Limiting

Google Sheets API has quotas:
- 100 requests per 100 seconds per user
- 500 requests per 100 seconds per project

The app refreshes every 60 seconds, which is well within limits.

To adjust refresh rate:
```env
VITE_REFRESH_INTERVAL=120000  # 2 minutes
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use .env.local** for local development secrets
3. **Restrict API keys** by referrer in production
4. **Use service accounts** for production deployments
5. **Set minimum permissions** (Viewer only)
6. **Rotate keys regularly** if exposed
7. **Monitor API usage** in Google Cloud Console

## Production Checklist

Before deploying to production:

- [ ] Service account created and configured
- [ ] Sheet shared with service account
- [ ] Environment variables set in hosting platform
- [ ] API key restrictions configured (if using API key)
- [ ] Tested data loading in production build
- [ ] Verified refresh interval works
- [ ] Checked browser console for errors
- [ ] Confirmed all calculations are correct
- [ ] Tested on mobile devices

## Need Help?

If you're still having issues:

1. Check the [main README](README.md)
2. Review Google's [Sheets API documentation](https://developers.google.com/sheets/api)
3. Check your browser console for specific error messages
4. Verify your sheet structure matches requirements
5. Contact your development team

---

**Last Updated**: January 2026

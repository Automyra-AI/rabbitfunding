# Quick Start Guide

Get your MCA Syndication Manager running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Google account with access to your MCA data spreadsheet

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Set Up Google Sheets (2 minutes)

### Get Your Spreadsheet ID

1. Open your Google Sheet
2. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
   ```

### Make Sheet Public

1. Click "Share" in Google Sheets
2. Change to "Anyone with the link"
3. Set permission to "Viewer"

### Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable "Google Sheets API"
4. Create Credentials > API Key
5. Copy the key

## Step 3: Configure Environment (1 minute)

```bash
# Copy example file
copy .env.example .env
```

Edit `.env` and add your values:

```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC-your-key-here
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1abc123def456
VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events
```

## Step 4: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## That's It!

You should see:
- ✅ Dashboard with your performance stats
- ✅ Advances table with all deals
- ✅ Ledger with transaction history

## Using Mock Data

If you don't have Google Sheets set up yet, the app will automatically use mock data. Just run:

```bash
npm run dev
```

## Next Steps

1. **Verify Your Data**: Check that the numbers match your Google Sheet
2. **Customize**: Update colors, company name, etc.
3. **Deploy**: Use Netlify or Vercel for free hosting

## Troubleshooting

### No Data Showing?

1. Check browser console for errors (F12)
2. Verify your `.env` file has correct values
3. Make sure Google Sheet is publicly accessible
4. Test the API manually:
   ```
   https://sheets.googleapis.com/v4/spreadsheets/YOUR_ID/values/Deals?key=YOUR_KEY
   ```

### Build Errors?

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Still Stuck?

Check the detailed guides:
- [Full README](README.md) - Complete documentation
- [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md) - Detailed API setup
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

## Sheet Structure

Make sure your Google Sheet has these tabs:

### Deals Tab
Headers: `QBO Customer ID`, `QBO Customer Name`, `Principal Advanced`, `Actum Merchant ID`, `Principal Collected`, `Status`, `Fee Collected`

### Payout Events Tab
Headers: `History KeyID`, `Client Name`, `Amount`, `Principal Applied`, `Fee Applied`, `Transaction Date`

See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for complete schema.

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Check code quality
```

## What You Get

### Dashboard
- Balance metrics (Available, Frozen, Pending, Outstanding)
- Performance stats (Syndicated $, CAFs, TCP, Paid Back)
- **NEW**: Net Syndicated Amount feature

### Advances
- Complete deal tracking
- Sortable columns
- Status filters
- Column visibility toggle
- Progress indicators
- Totals row

### Ledger
- Transaction history
- Running balance
- Date filters
- Account type selector (Available/Frozen)

## Need More Help?

- 📖 Read the [full documentation](README.md)
- 🔧 Check [troubleshooting guide](GOOGLE_SHEETS_SETUP.md#troubleshooting)
- 🚀 Review [deployment options](DEPLOYMENT.md)

---

**Happy tracking! 🎉**

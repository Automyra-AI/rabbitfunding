# 🚀 Quick Reference Card - MCA Syndication App

## ⚡ Getting Started NOW

### Your App is Running!
```
✅ Development Server: http://localhost:3001
✅ Status: Running and ready
✅ All code: Complete and polished
```

---

## 🎯 3 Steps to Success

### Step 1: Make Google Sheet Public (2 minutes)

1. **Open your sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/edit
   ```

2. **Click "Share" button** (top right, blue)

3. **Change to "Anyone with the link" + "Viewer"**

4. **Click "Done"**

---

### Step 2: Test API Connection (30 seconds)

**Open this URL in your browser:**
```
https://sheets.googleapis.com/v4/spreadsheets/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/values/Deals?key=AIzaSyDuTd3Jo0AHBrwLwROdJRoLhfiaCY-IBI4
```

**Expected:** See JSON data (not an error!)

---

### Step 3: Open Your App (10 seconds)

1. **Go to:** http://localhost:3001

2. **Press F12** (open Developer Tools)

3. **Check Console tab** - Look for:
   ```
   ✅ Found X deals in Google Sheets
   ✅ Found X payout events in Google Sheets
   ```

**That's it!** Your app should now display your real data!

---

## 📁 File Locations

### Key Files You Might Need:

**Environment Config:**
```
.env - Your API keys (already configured ✅)
```

**Google Sheets Integration:**
```
src/services/googleSheets.js - API calls (fixed with URL encoding ✅)
```

**Main Pages:**
```
src/pages/Dashboard.jsx - Overview with balance cards & metrics
src/pages/Advances.jsx - Deal management table
src/pages/Ledger.jsx - Transaction ledger
```

**Components:**
```
src/components/Navbar.jsx - Top navigation
src/components/Sidebar.jsx - Side navigation
src/components/LoadingSpinner.jsx - Loading indicator
src/components/ErrorMessage.jsx - Error display
```

---

## 🎨 What You Have

### Dashboard Features:
- ✅ 4 Balance Cards (Available, Deployed, Reserve, Outstanding)
- ✅ 7 Performance Metrics (including **Net Syndicated Amount** ✨ NEW)
- ✅ Auto-refresh every 60 seconds
- ✅ Professional gradients and animations
- ✅ Color-coded icons for each metric

### Advances Page Features:
- ✅ Complete deal table with 13 columns
- ✅ Sortable columns
- ✅ Search and filters
- ✅ Progress bars for payback %
- ✅ Status badges (color-coded)
- ✅ Totals row at bottom
- ✅ Pagination (20 per page)
- ✅ Export functionality

### Ledger Page Features:
- ✅ Transaction history
- ✅ Account type toggle (Available/Deployed/Reserve)
- ✅ Color-coded credits (green) and debits (red)
- ✅ Date filters
- ✅ Search functionality
- ✅ Running balance display
- ✅ Pagination (50 per page)

---

## ⚡ Quick Commands

### Start Development Server:
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

### Install Dependencies (if needed):
```bash
npm install
```

---

## 🔧 Troubleshooting Cheat Sheet

### Problem: "Failed to fetch" errors
**Solution:** Make Google Sheet public (see Step 1 above)

### Problem: Shows mock data instead of real data
**Solution:** Check `.env` file exists and restart server

### Problem: Empty data or "No deals found"
**Solution:** Verify Google Sheet has data in rows 2+

### Problem: Calculations seem wrong
**Solution:** Check column headers match expected names

### Problem: Port in use
**Solution:** Vite will auto-select another port (shown in terminal)

---

## 📊 Required Sheet Structure

### Deals Tab - Must Have These Columns:
```
QBO Customer Name
Principal Advanced
Fee Collected
Principal Collected
Status
Date Funded
```

### Payout Events Tab - Must Have These Columns:
```
Client Name
Amount
Principal Applied
Fee Applied
Transaction Date
```

**Note:** First row = headers, Data starts row 2

---

## 🎯 Success Checklist

- [ ] Google Sheet is public ("Anyone with the link - Viewer")
- [ ] API test URL shows JSON (not 403 error)
- [ ] Browser console shows "✅ Found X deals"
- [ ] Dashboard displays real numbers
- [ ] Advances table shows your deals
- [ ] Ledger shows transactions
- [ ] No errors in console

---

## 📚 Full Documentation

**For detailed guides, see:**
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Complete status overview
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Detailed testing guide
- [GOOGLE_SHEETS_FIX.md](GOOGLE_SHEETS_FIX.md) - Troubleshooting guide
- [README.md](README.md) - Full project documentation

---

## 🎊 You're All Set!

Your professional MCA Syndication App is ready to use. Just complete the 3 steps above and you're live!

**Questions?** Check [GOOGLE_SHEETS_FIX.md](GOOGLE_SHEETS_FIX.md) for detailed troubleshooting.

---

**Version:** 1.0.0 | **Updated:** January 14, 2026 | **Status:** ✅ Ready

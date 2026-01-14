# 🧪 Testing Checklist - MCA Syndication App

## ✅ Current Status

Your application is **READY TO TEST**! The development server is running at:
```
http://localhost:3001
```

All design improvements and Google Sheets fixes have been applied.

---

## 🎯 Pre-Testing Checklist

### 1. Google Sheets Access (CRITICAL!)

**Your Google Sheet:**
```
https://docs.google.com/spreadsheets/d/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/edit
```

**MUST DO:**
- [ ] Open the Google Sheet
- [ ] Click the blue "Share" button (top right)
- [ ] Change from "Restricted" to **"Anyone with the link"**
- [ ] Ensure the dropdown shows **"Viewer"** (not Editor)
- [ ] Click "Done"
- [ ] Verify you see: 🌐 Anyone with the link - Viewer

**Quick Test:** Open this URL in your browser (should show JSON, not an error):
```
https://sheets.googleapis.com/v4/spreadsheets/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/values/Deals?key=AIzaSyDuTd3Jo0AHBrwLwROdJRoLhfiaCY-IBI4
```

If you see an error like `"code": 403`, your sheet is NOT public yet!

---

### 2. Google Sheets API Enabled

**MUST DO:**
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Select your project
- [ ] Go to **"APIs & Services"** > **"Library"**
- [ ] Search for **"Google Sheets API"**
- [ ] Ensure it shows **"Enabled"** (if not, click Enable)

---

### 3. Sheet Tab Names

**Verify your Google Sheet has these tabs:**
- [ ] Tab named exactly: `Deals` (no spaces, capital D)
- [ ] Tab named exactly: `Payout Events` (with space, capitals P and E)

**Note:** The space in "Payout Events" is now handled by URL encoding ✅

---

## 🚀 Testing Steps

### Step 1: Open the Application

1. **Open your browser** (Chrome, Edge, or Firefox recommended)
2. **Navigate to:** http://localhost:3001
3. The Dashboard should load

---

### Step 2: Check Browser Console

**VERY IMPORTANT:** Open Developer Tools
- Press **F12** on Windows/Linux
- Press **Cmd+Option+I** on Mac
- Or right-click anywhere → "Inspect"

**Go to the "Console" tab** and look for these messages:

✅ **SUCCESS - You should see:**
```
Fetching deals from: Deals
✅ Found 10 deals in Google Sheets

Fetching payout events from: Payout Events
✅ Found 25 payout events in Google Sheets
```

❌ **ERROR - You might see:**
```
Failed to fetch deals data: Forbidden - The caller does not have permission
```
→ **Solution:** Go back and make your Google Sheet PUBLIC (Step 1.1)

```
Failed to fetch deals data: Not Found - Unable to parse range
```
→ **Solution:** Check your tab names match exactly (Step 3)

---

### Step 3: Verify Data Display

**Dashboard Page:**
- [ ] Balance cards show your actual numbers (not mock data)
- [ ] Performance stats display correctly
- [ ] All 4 balance metrics visible
- [ ] All 7 performance metrics visible
- [ ] "Net Syndicated Amount" shows with ✨ NEW badge

**Advances Page:**
- [ ] Table shows your deals from Google Sheets
- [ ] All columns display correctly
- [ ] Status badges are color-coded (Active = green, etc.)
- [ ] Progress bars show paid back percentage
- [ ] Totals row at bottom shows correct sums
- [ ] Pagination works (if more than 20 deals)

**Ledger Page:**
- [ ] Transactions display in chronological order
- [ ] Current balance shows correctly
- [ ] Credit/Debit indicators are color-coded
- [ ] Date filters work
- [ ] Search functionality works

---

### Step 4: Test Auto-Refresh

The app auto-refreshes data every 60 seconds.

**To test:**
1. **Note the current time** shown in the navbar (next to "Live" indicator)
2. **Wait 60 seconds**
3. **Check if the time updates**
4. **Open browser console** - should see new fetch messages

**Manual Refresh:**
- [ ] Click the refresh button in the navbar
- [ ] Data should reload immediately
- [ ] Console shows new fetch messages

---

### Step 5: Test Responsive Design

**Desktop View:**
- [ ] Sidebar is visible on the left
- [ ] All cards display in grid layout
- [ ] Tables show all columns
- [ ] No horizontal scrolling

**Mobile View (resize browser to 400px width):**
- [ ] Sidebar hides automatically
- [ ] Hamburger menu appears in navbar
- [ ] Cards stack vertically
- [ ] Tables are scrollable horizontally
- [ ] All features accessible

**Tablet View (resize to 768px):**
- [ ] Layout adapts smoothly
- [ ] Cards display in 2-column grid
- [ ] Sidebar can be toggled

---

## 🎨 Design Quality Checks

### Visual Polish
- [ ] All buttons have smooth hover effects (scale up slightly)
- [ ] Gradients are smooth and professional
- [ ] Loading spinner shows during data fetch
- [ ] Error messages are styled professionally
- [ ] Icons appear next to all metrics
- [ ] Badge colors match their meaning (green=good, red=warning)
- [ ] Shadows add depth without being excessive

### Animations
- [ ] Page transitions are smooth
- [ ] Cards fade in when loading
- [ ] Hover effects are responsive
- [ ] Loading spinner rotates smoothly
- [ ] Live indicator pulses gently

### Typography
- [ ] All text is readable
- [ ] Font sizes are appropriate
- [ ] Font weights create visual hierarchy
- [ ] No text overflow or cutoff

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" errors

**Symptoms:**
- Red error message in console
- Error component shows on page
- Data doesn't load

**Solutions:**
1. ✅ Make Google Sheet PUBLIC (see Step 1.1)
2. ✅ Enable Google Sheets API in Cloud Console
3. ✅ Check API key is correct in `.env`
4. ✅ Restart dev server: `Ctrl+C` then `npm run dev`

---

### Issue 2: Shows mock data instead of real data

**Symptoms:**
- Data loads but looks fake/generic
- Console shows "Using mock data"

**Solutions:**
1. ✅ Verify `.env` file exists with API key
2. ✅ Check `.env` has `VITE_` prefix on all variables
3. ✅ Restart dev server after changing `.env`

**Check your `.env` file:**
```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyDuTd3Jo0AHBrwLwROdJRoLhfiaCY-IBI4
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo
VITE_GOOGLE_SHEETS_DEALS_TAB=Deals
VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB=Payout Events
```

---

### Issue 3: Empty data or "No deals found"

**Symptoms:**
- App loads but shows "No data"
- Tables are empty

**Solutions:**
1. ✅ Verify your Google Sheet has data
2. ✅ First row must be headers
3. ✅ Data should start from row 2
4. ✅ Check tab names are correct
5. ✅ Make sure sheet has at least 2 rows (headers + data)

---

### Issue 4: Incorrect calculations

**Symptoms:**
- Numbers don't add up
- Negative values where shouldn't be
- Percentages over 100%

**Solutions:**
1. ✅ Check column headers match expected names
2. ✅ Verify numeric columns contain only numbers
3. ✅ Remove any currency symbols from sheet ($, commas)
4. ✅ Check date format is consistent

**Expected Column Names:**

**Deals Tab:**
- `QBO Customer ID`
- `QBO Customer Name`
- `Principal Advanced`
- `Fee Collected`
- `Principal Collected`
- `Status`
- `Date Funded`

**Payout Events Tab:**
- `History KeyID`
- `Client Name`
- `Amount`
- `Principal Applied`
- `Fee Applied`
- `Transaction Date`

---

### Issue 5: Port 3001 is in use

**Symptoms:**
```
Port 3001 is in use, trying another one...
```

**Solutions:**
1. ✅ Close any other apps using port 3001
2. ✅ Let Vite choose another port automatically
3. ✅ Or manually kill the process:
   - Windows: `netstat -ano | findstr :3001` then `taskkill /PID [number] /F`
   - Mac/Linux: `lsof -i :3001` then `kill -9 [PID]`

---

## 📊 Data Quality Checks

### Deals Data
- [ ] All deals have a customer name
- [ ] Principal Advanced values are numbers
- [ ] Fee Collected values are numbers
- [ ] Status values are consistent (Active, Paid Off, etc.)
- [ ] Dates are in a recognizable format

### Payout Events Data
- [ ] All events have a client name
- [ ] Client names match deal customer names
- [ ] Amount values are positive numbers
- [ ] Dates are chronological

---

## ✅ Success Criteria

**Your app is working correctly when:**

1. ✅ **No errors in browser console**
   - Only info/log messages
   - Green checkmarks: "✅ Found X deals in Google Sheets"

2. ✅ **Real data displays**
   - Dashboard shows your actual numbers
   - Advances table shows your deals
   - Ledger shows your transactions

3. ✅ **Calculations are accurate**
   - Available Capital = correct
   - Syndicated Amount matches your sheet
   - Net Syndicated Amount = Syndicated - CAFs
   - Paid Back % is realistic (0-100%)

4. ✅ **Auto-refresh works**
   - Time updates every 60 seconds
   - Data reloads automatically
   - Console shows periodic fetch messages

5. ✅ **Professional appearance**
   - Smooth animations
   - Responsive design
   - No visual glitches
   - Icons and colors appropriate

---

## 🎯 Final Verification

**Open these URLs in separate browser tabs:**

1. **Application:**
   ```
   http://localhost:3001
   ```

2. **API Test (Deals):**
   ```
   https://sheets.googleapis.com/v4/spreadsheets/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/values/Deals?key=AIzaSyDuTd3Jo0AHBrwLwROdJRoLhfiaCY-IBI4
   ```

3. **API Test (Payout Events):**
   ```
   https://sheets.googleapis.com/v4/spreadsheets/1SnG3tHCuvhijtHU0W_kCdmWVRLSCNDxRi7CiEBFQvOo/values/Payout%20Events?key=AIzaSyDuTd3Jo0AHBrwLwROdJRoLhfiaCY-IBI4
   ```

**All three should work without errors!**

---

## 📞 Need Help?

**If you see errors in the console:**
1. Copy the exact error message
2. Check which URL is failing
3. Verify the sheet access settings
4. Review the error code:
   - **403**: Permission denied → Make sheet PUBLIC
   - **404**: Not found → Check tab names
   - **400**: Bad request → Check API key
   - **401**: Unauthorized → Invalid API key

**Debugging Steps:**
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for red error messages
4. Go to "Network" tab
5. Look for failed requests (red text)
6. Click on them to see details

---

## 🎊 Congratulations!

Once all checks pass, your MCA Syndication App is:
- ✅ Connected to live Google Sheets data
- ✅ Auto-refreshing every 60 seconds
- ✅ Professionally designed and polished
- ✅ Fully responsive (desktop, tablet, mobile)
- ✅ Ready for investor presentations

**Enjoy your new syndication management platform!** 🚀

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅

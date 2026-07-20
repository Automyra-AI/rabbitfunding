# Apps Script — Full Script with "Edit Deal Terms" + "Add Deal" Handlers Added

This is your complete Apps Script, with two handlers wired in:
- `updateDeal` — look for `// ── NEW: updateDeal ──` in `doPost` and `handleUpdateDeal` further down.
- `addDeal` — look for `// ── NEW: addDeal ──` in `doPost` and `handleAddDeal` near the bottom.

Everything else is untouched — same column mapping, same style as
`handleDeleteDeal` / `markDealPaidInFull`.

**To deploy:** select all the code in your Apps Script project, replace it with
the full script below, save, then **Deploy → Manage deployments → Edit → New
version → Deploy**. The Web App URL stays the same.

## What `handleUpdateDeal` writes

Only raw deal-term cells — Paid, Fee, Status, Progress and Balance are always
recomputed by the React app from Payout Events on the next fetch, so they're
never touched here:

| `updates` key                     | Column | 1-based col # |
|------------------------------------|--------|----------------|
| `receivables_purchased_amount`     | D      | 4              |
| `funded_date`                      | F      | 6              |
| `purchase_price`                   | G      | 7              |
| `last_payment_amount`              | S      | 19             |
| `syndicated_amount_origination`    | W      | 23             |
| `payment_frequency`                | X      | 24             |

These match the exact columns your `markDealPaidInFull` function already reads
(col D = index 3, col G = index 6, col J = index 9, etc. — same 0-based scheme).

## What `handleAddDeal` writes

Appends a brand-new row to 💼 Deals. Before appending, it rejects the request
if an active (non-deleted) row already exists with the same name in col B or
col I — client name is the join key the waterfall verification and every
other handler matches on, so duplicates would silently corrupt collections
math for both deals.

| Field                              | Column | 1-based col # | Default if omitted |
|-------------------------------------|--------|----------------|---------------------|
| `qbo_customer_id`                   | A      | 1              | `''`                |
| `client_name`                       | B, I   | 2, 9           | *(required)*        |
| `contract_id`                       | C      | 3              | `''`                |
| `receivables_purchased_amount`      | D      | 4              | `0`                 |
| `actum_merchant_id`                 | E      | 5              | `''`                |
| `funded_date`                       | F, L   | 6, 12          | today                |
| `purchase_price`                    | G      | 7              | `0`                 |
| `deal_id`                           | H      | 8              | `''`                |
| — Principal Collected                | J      | 10             | `0`                  |
| — Status                             | K      | 11             | `'Active'`            |
| `last_payment_amount`               | S      | 19             | `0`                  |
| — Fee Collected                      | U      | 21             | `0`                   |
| `customer_email`                    | V      | 22             | `''`                 |
| `syndicated_amount_origination`     | W      | 23             | `0`                   |
| `payment_frequency`                 | X      | 24             | `'Business Day'`      |
| — Deleted                            | Y      | 25             | `false`                |

Rows marked `—` are always set by the handler itself (not caller-supplied) so
every new deal starts in the same clean state as a real funded deal.

## Full Script

```javascript
// ============================================
// MCA DASHBOARD - CORRECT COLUMN MAPPING
// ============================================

function setupDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    formatDealsSheet();
    formatPayoutEventsSheet();

    let dashboard = ss.getSheetByName('📊 Dashboard');
    if (dashboard) {
      ss.deleteSheet(dashboard);
    }
    dashboard = ss.insertSheet('📊 Dashboard', 0);
    dashboard.setTabColor('#4285F4');

    buildDashboard(dashboard);

    SpreadsheetApp.getUi().alert('✅ Dashboard created with CORRECT columns!\n\nRefresh the page to see it.');

  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.toString());
  }
}

function buildDashboard(sheet) {
  // Set column widths
  for (let i = 1; i <= 12; i++) {
    sheet.setColumnWidth(i, 100);
  }

  // ============================================
  // HEADER
  // ============================================
  sheet.getRange('A1:L2').merge()
    .setValue('🏦 MCA Portfolio Dashboard')
    .setFontSize(24).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBackground('#4285F4').setFontColor('#FFFFFF');

  sheet.getRange('A3:L3').merge()
    .setFormula('="Last Updated: " & TEXT(NOW(), "MMM DD, YYYY hh:mm AM/PM")')
    .setHorizontalAlignment('center').setFontSize(10)
    .setFontColor('#666666').setBackground('#F8F9FA');

  sheet.setFrozenRows(3);

  // ============================================
  // KPI CARDS - ROW 1
  // ============================================

  // Card 1 - Total Principal Advanced (Column G)
  sheet.getRange(5, 1, 4, 3).setBackground('#E8F5E9')
    .setBorder(true, true, true, true, false, false, '#2E7D32', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(5, 1, 1, 3).merge().setValue('💰 Total Principal Advanced')
    .setFontSize(11).setFontWeight('bold').setFontColor('#2E7D32')
    .setHorizontalAlignment('center');
  sheet.getRange(6, 1, 3, 3).merge()
    .setFormula('=TEXT(SUM(\'💼 Deals\'!G:G), "$#,##0")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#2E7D32')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 2 - Total Principal Collected (Column J)
  sheet.getRange(5, 4, 4, 3).setBackground('#E3F2FD')
    .setBorder(true, true, true, true, false, false, '#1976D2', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(5, 4, 1, 3).merge().setValue('✅ Total Principal Collected')
    .setFontSize(11).setFontWeight('bold').setFontColor('#1976D2')
    .setHorizontalAlignment('center');
  sheet.getRange(6, 4, 3, 3).merge()
    .setFormula('=TEXT(SUM(\'💼 Deals\'!J:J), "$#,##0")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#1976D2')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 3 - Total Outstanding (G - J)
  sheet.getRange(5, 7, 4, 3).setBackground('#FFF3E0')
    .setBorder(true, true, true, true, false, false, '#F57C00', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(5, 7, 1, 3).merge().setValue('⏳ Total Outstanding')
    .setFontSize(11).setFontWeight('bold').setFontColor('#F57C00')
    .setHorizontalAlignment('center');
  sheet.getRange(6, 7, 3, 3).merge()
    .setFormula('=TEXT(SUM(\'💼 Deals\'!G:G)-SUM(\'💼 Deals\'!J:J), "$#,##0")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#F57C00')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 4 - Total Fees Collected (Column U)
  sheet.getRange(5, 10, 4, 3).setBackground('#F3E5F5')
    .setBorder(true, true, true, true, false, false, '#7B1FA2', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(5, 10, 1, 3).merge().setValue('🎯 Total Fees Collected')
    .setFontSize(11).setFontWeight('bold').setFontColor('#7B1FA2')
    .setHorizontalAlignment('center');
  sheet.getRange(6, 10, 3, 3).merge()
    .setFormula('=TEXT(SUM(\'💼 Deals\'!U:U), "$#,##0")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#7B1FA2')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // ============================================
  // KPI CARDS - ROW 2
  // ============================================

  // Card 5 - Active Deals (Column K)
  sheet.getRange(10, 1, 4, 3).setBackground('#E8F5E9')
    .setBorder(true, true, true, true, false, false, '#2E7D32', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(10, 1, 1, 3).merge().setValue('📋 Active Deals')
    .setFontSize(11).setFontWeight('bold').setFontColor('#2E7D32')
    .setHorizontalAlignment('center');
  sheet.getRange(11, 1, 3, 3).merge()
    .setFormula('=COUNTIF(\'💼 Deals\'!K:K, "Active")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#2E7D32')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 6 - Paid Off Deals (Column K)
  sheet.getRange(10, 4, 4, 3).setBackground('#E3F2FD')
    .setBorder(true, true, true, true, false, false, '#1976D2', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(10, 4, 1, 3).merge().setValue('🎉 Paid Off Deals')
    .setFontSize(11).setFontWeight('bold').setFontColor('#1976D2')
    .setHorizontalAlignment('center');
  sheet.getRange(11, 4, 3, 3).merge()
    .setFormula('=COUNTIF(\'💼 Deals\'!K:K, "PaidOff")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#1976D2')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 7 - Collection Rate
  sheet.getRange(10, 7, 4, 3).setBackground('#FFF3E0')
    .setBorder(true, true, true, true, false, false, '#F57C00', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(10, 7, 1, 3).merge().setValue('📊 Collection Rate')
    .setFontSize(11).setFontWeight('bold').setFontColor('#F57C00')
    .setHorizontalAlignment('center');
  sheet.getRange(11, 7, 3, 3).merge()
    .setFormula('=TEXT(IFERROR(SUM(\'💼 Deals\'!J:J)/SUM(\'💼 Deals\'!G:G),0), "0.0%")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#F57C00')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Card 8 - Avg Deal Size
  sheet.getRange(10, 10, 4, 3).setBackground('#F3E5F5')
    .setBorder(true, true, true, true, false, false, '#7B1FA2', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(10, 10, 1, 3).merge().setValue('💵 Avg Deal Size')
    .setFontSize(11).setFontWeight('bold').setFontColor('#7B1FA2')
    .setHorizontalAlignment('center');
  sheet.getRange(11, 10, 3, 3).merge()
    .setFormula('=TEXT(AVERAGE(\'💼 Deals\'!G:G), "$#,##0")')
    .setFontSize(28).setFontWeight('bold').setFontColor('#7B1FA2')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // ============================================
  // DEALS TABLE
  // ============================================

  // Header
  sheet.getRange(15, 1, 1, 12).merge()
    .setValue('📋 Active Deals')
    .setFontSize(16).setFontWeight('bold')
    .setBackground('#4285F4').setFontColor('#FFFFFF')
    .setHorizontalAlignment('left').setVerticalAlignment('middle');

  // Column headers
  const headers = ['Customer', 'Principal\nAdvanced', 'Principal\nCollected',
                   'Outstanding', 'Fees\nCollected', 'Progress', 'Status',
                   'Last\nPayment', 'Updated'];
  sheet.getRange(16, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#E8EAF6').setFontColor('#1A237E')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setWrap(true).setBorder(true, true, true, true, true, true);
  sheet.setRowHeight(16, 40);

  // Data formulas with CORRECT column references
  for (let i = 0; i < 20; i++) {
    const row = 17 + i;
    const sourceRow = 2 + i;

    // Column B: QBO Customer Name
    sheet.getRange(row, 1).setFormula(`=IFERROR('💼 Deals'!B${sourceRow}, "")`);

    // Column G: Principal Advanced
    sheet.getRange(row, 2).setFormula(`=IF(A${row}="","",TEXT('💼 Deals'!G${sourceRow},"$#,##0"))`);

    // Column J: Principal Collected
    sheet.getRange(row, 3).setFormula(`=IF(A${row}="","",TEXT('💼 Deals'!J${sourceRow},"$#,##0"))`);

    // Outstanding: G - J
    sheet.getRange(row, 4).setFormula(`=IF(A${row}="","",TEXT('💼 Deals'!G${sourceRow}-'💼 Deals'!J${sourceRow},"$#,##0"))`);

    // Column U: Fee Collected
    sheet.getRange(row, 5).setFormula(`=IF(A${row}="","",TEXT('💼 Deals'!U${sourceRow},"$#,##0"))`);

    // Progress: J / G
    sheet.getRange(row, 6).setFormula(`=IF(A${row}="","",TEXT(IFERROR('💼 Deals'!J${sourceRow}/'💼 Deals'!G${sourceRow},0),"0.0%"))`);

    // Column K: Status
    sheet.getRange(row, 7).setFormula(`=IF(A${row}="","",'💼 Deals'!K${sourceRow})`);

    // Column S: Last Payment Amount
    sheet.getRange(row, 8).setFormula(`=IF(A${row}="","",TEXT('💼 Deals'!S${sourceRow},"$#,##0"))`);

    // Column P: Updated Date
    sheet.getRange(row, 9).setFormula(`=IF(A${row}="","",'💼 Deals'!P${sourceRow})`);
  }

  // Format table
  sheet.getRange(17, 1, 20, 9)
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);

  // Status colors
  const statusRange = sheet.getRange(17, 7, 20, 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Active')
      .setBackground('#C8E6C9').setFontColor('#2E7D32').setBold(true)
      .setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('PaidOff')
      .setBackground('#BBDEFB').setFontColor('#1976D2').setBold(true)
      .setRanges([statusRange]).build()
  ];
  sheet.setConditionalFormatRules(rules);

  // ============================================
  // RECENT ACTIVITY
  // ============================================

  // Header
  sheet.getRange(38, 1, 1, 12).merge()
    .setValue('🔔 Recent Activity (Last 10 Payments)')
    .setFontSize(16).setFontWeight('bold')
    .setBackground('#4285F4').setFontColor('#FFFFFF')
    .setHorizontalAlignment('left').setVerticalAlignment('middle');

  // Column headers
  const activityHeaders = ['Date', 'Client', 'Amount', 'Principal\nApplied', 'Fee\nApplied', 'History Key'];
  sheet.getRange(39, 1, 1, activityHeaders.length).setValues([activityHeaders])
    .setFontWeight('bold').setBackground('#E8EAF6').setFontColor('#1A237E')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setWrap(true).setBorder(true, true, true, true, true, true);
  sheet.setRowHeight(39, 40);

  // Data formulas
  for (let i = 0; i < 10; i++) {
    const row = 40 + i;
    const idx = `COUNTA('📜 Payout Events'!A:A)-${i}`;

    sheet.getRange(row, 1).setFormula(`=IF(${idx}<2,"",INDEX('📜 Payout Events'!I:I,${idx}))`);
    sheet.getRange(row, 2).setFormula(`=IF(${idx}<2,"",INDEX('📜 Payout Events'!E:E,${idx}))`);
    sheet.getRange(row, 3).setFormula(`=IF(${idx}<2,"",TEXT(INDEX('📜 Payout Events'!F:F,${idx}),"$#,##0"))`);
    sheet.getRange(row, 4).setFormula(`=IF(${idx}<2,"",TEXT(INDEX('📜 Payout Events'!G:G,${idx}),"$#,##0"))`);
    sheet.getRange(row, 5).setFormula(`=IF(${idx}<2,"",TEXT(INDEX('📜 Payout Events'!H:H,${idx}),"$#,##0"))`);
    sheet.getRange(row, 6).setFormula(`=IF(${idx}<2,"",INDEX('📜 Payout Events'!A:A,${idx}))`);
  }

  // Format
  sheet.getRange(40, 1, 10, 6)
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
}

function formatDealsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Sheet1');
  if (!sheet) sheet = ss.getSheetByName('💼 Deals');
  if (!sheet) return;

  sheet.setName('💼 Deals');
  sheet.setTabColor('#34A853');

  const lastCol = Math.max(sheet.getLastColumn(), 22);
  sheet.getRange(1, 1, 1, lastCol)
    .setBackground('#34A853').setFontColor('#FFFFFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);

  sheet.setFrozenRows(1);

  for (let i = 1; i <= lastCol; i++) {
    sheet.autoResizeColumn(i);
  }

  // Status column (K) conditional formatting
  const lastRow = Math.max(sheet.getLastRow(), 50);
  const statusRange = sheet.getRange(2, 11, lastRow - 1, 1);

  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Active')
      .setBackground('#C8E6C9').setFontColor('#2E7D32').setBold(true)
      .setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('PaidOff')
      .setBackground('#BBDEFB').setFontColor('#1976D2').setBold(true)
      .setRanges([statusRange]).build()
  ];
  sheet.setConditionalFormatRules(rules);
}

function formatPayoutEventsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Payout Events');
  if (!sheet) sheet = ss.getSheetByName('📜 Payout Events');
  if (!sheet) return;

  sheet.setName('📜 Payout Events');
  sheet.setTabColor('#FBBC04');

  const lastCol = Math.max(sheet.getLastColumn(), 15);
  sheet.getRange(1, 1, 1, lastCol)
    .setBackground('#FBBC04').setFontColor('#FFFFFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);

  sheet.setFrozenRows(1);

  for (let i = 1; i <= lastCol; i++) {
    sheet.autoResizeColumn(i);
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 Dashboard')
    .addItem('Refresh Dashboard', 'setupDashboard')
    .addToUi();
}

// ============================================
// WEB APP - HANDLES UPDATES FROM REACT APP
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    if (data.action === 'updatePayoutEvent') {
      return updatePayoutEvent(data.historyKeyId, data.updates)
    }

    if (data.action === 'markDealPaidInFull') {
      return markDealPaidInFull(data)
    }

    if (data.action === 'deleteDeal') {
      return handleDeleteDeal(data)
    }

    // ── NEW: updateDeal ──────────────────────
    if (data.action === 'updateDeal') {
      return handleUpdateDeal(data)
    }
    // ────────────────────────────────────────

    // ── NEW: addDeal ─────────────────────────
    if (data.action === 'addDeal') {
      return handleAddDeal(data)
    }
    // ────────────────────────────────────────

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function updatePayoutEvent(historyKeyId, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  // Try both sheet names (with and without emoji)
  const sheet = ss.getSheetByName('📜 Payout Events') || ss.getSheetByName('Payout Events')

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Payout Events sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const data = sheet.getDataRange().getValues()
  let targetRow = -1

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(historyKeyId).trim()) {
      targetRow = i + 1  // 1-based row number
      break
    }
  }

  if (targetRow === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Transaction ' + historyKeyId + ' not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  // Column mapping (1-based):
  // E=5 Client Name | F=6 Amount | G=7 Principal | H=8 Fee
  // M=13 Match Method | O=15 Error | R=18 Status Override
  if (updates.clientName !== undefined)       sheet.getRange(targetRow, 5).setValue(updates.clientName)
  if (updates.amount !== undefined)           sheet.getRange(targetRow, 6).setValue(updates.amount)
  if (updates.principalApplied !== undefined) sheet.getRange(targetRow, 7).setValue(updates.principalApplied)
  if (updates.feeApplied !== undefined)       sheet.getRange(targetRow, 8).setValue(updates.feeApplied)
  if (updates.matchMethod !== undefined)      sheet.getRange(targetRow, 13).setValue(updates.matchMethod)
  if (updates.error !== undefined)            sheet.getRange(targetRow, 15).setValue(updates.error)
  if (updates.status !== undefined)           sheet.getRange(targetRow, 18).setValue(updates.status)

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, row: targetRow }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ============================================
// MARK DEAL AS PAID IN FULL (Zelle / Wire / Check / Cash)
// Discount reduces the Receivables Purchased Amount (Payback) so it reflects
// the actual amount collected post-discount. Discount info is recorded inline
// in the manual row's Match Method (no separate DISCOUNT row needed).
// ============================================
function markDealPaidInFull(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const payment = data.payment || {}
  const deal = data.deal || {}
  const discount = Number(payment.discount) || 0

  // --- 1. Append SETTLED manual row to Payout Events (actual cash received only) ---
  const payoutSheet = ss.getSheetByName('📜 Payout Events') || ss.getSheetByName('Payout Events')
  if (!payoutSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Payout Events sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  // Build method label — embed discount note inline so audit trail is preserved
  let methodLabel = 'Manual - ' + (payment.method || 'Other')
  if (discount > 0) methodLabel += ' | Early Payoff Discount: $' + discount + ' forgiven'
  if (payment.note) methodLabel += ' | ' + payment.note

  const txDate = payment.date
    ? Utilities.formatDate(new Date(payment.date), Session.getScriptTimeZone(), 'MMM dd, yyyy hh:mm a')
    : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy hh:mm a')

  const clientName = deal.qbo_customer_name || deal.client_name || ''

  const paymentRow = [
    data.historyKeyId || ('MANUAL-' + Date.now()),   // A  History KeyID
    deal.contract_id || '',                           // B  Order ID
    '',                                               // C  SubID
    deal.actum_merchant_id || '',                     // D  Consumer Unique ID
    clientName,                                       // E  Client Name
    payment.amount || 0,                              // F  Amount (actual cash only)
    '',                                               // G  Principal Applied (waterfall fills)
    '',                                               // H  Fee Applied (waterfall fills)
    txDate,                                           // I  Transaction Date
    txDate,                                           // J  Processed Date
    '',                                               // K
    '',                                               // L
    methodLabel,                                      // M  Match Method (includes discount note)
    '',                                               // N
    '',                                               // O
    'Debit',                                          // P  Transaction Type
    '',                                               // Q  Reference Key ID (MUST be empty)
    'settled'                                         // R  Manual Status Override
  ]
  payoutSheet.appendRow(paymentRow)

  // --- 2. Update Deals sheet ---
  // - If discount > 0: reduce Receivables Purchased Amount (col D) by discount
  //   so the Payback reflects the actual amount collected, AND recompute
  //   Principal Collected (col J) + Fee Collected (col U) to match the new payback
  // - Always: flip Status (col K) to PaidOff
  const dealsSheet = ss.getSheetByName('💼 Deals')
  if (dealsSheet) {
    const dealsData = dealsSheet.getDataRange().getValues()
    const targetQbo = String(deal.qbo_customer_name || '').toLowerCase().trim()
    const targetClient = String(deal.client_name || '').toLowerCase().trim()

    for (let i = 1; i < dealsData.length; i++) {
      const rowQbo = String(dealsData[i][1] || '').toLowerCase().trim()     // col B
      const rowClient = String(dealsData[i][8] || '').toLowerCase().trim()  // col I
      if ((targetQbo && rowQbo === targetQbo) ||
          (targetClient && (rowQbo === targetClient || rowClient === targetClient))) {
        const dealRow = i + 1
        const principalAdvanced = Number(dealsData[i][6]) || 0   // col G

        if (discount > 0) {
          const currentPayback = Number(dealsData[i][3]) || 0    // col D
          const newPayback = Math.max(0, currentPayback - discount)
          const newFee = Math.max(0, newPayback - principalAdvanced)
          dealsSheet.getRange(dealRow, 4).setValue(newPayback)         // col D = Receivables Purchased Amount
          dealsSheet.getRange(dealRow, 10).setValue(principalAdvanced) // col J = Principal Collected
          dealsSheet.getRange(dealRow, 21).setValue(newFee)            // col U = Fee Collected
        }

        dealsSheet.getRange(dealRow, 11).setValue('PaidOff')           // col K = Status
        break
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      historyKeyId: data.historyKeyId,
      discountApplied: discount
    }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ============================================
// DELETE DEAL (Soft Delete)
// Sets Deleted = TRUE on the deal row (col Y) and all related
// Payout Events rows (col S). Nothing is removed from the sheet.
// ============================================
function handleDeleteDeal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const deal = data.deal || {}

  const qboName  = String(deal.qbo_customer_name || '').toLowerCase().trim()
  const altName  = String(deal.client_name || '').toLowerCase().trim()
  const merchant = String(deal.actum_merchant_id || '').toLowerCase().trim()
  const contract = String(deal.contract_id || '').toLowerCase().trim()

  // --- 1. Flag the deal row in 💼 Deals (Deleted = column Y = col 25) ---
  const DEALS_DELETED_COL = 25  // 1-based (Y)
  const dealsSheet = ss.getSheetByName('💼 Deals')
  if (!dealsSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: '💼 Deals sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const dealsData = dealsSheet.getDataRange().getValues()
  let dealsFlagged = 0

  for (let i = 1; i < dealsData.length; i++) {
    const rowQbo    = String(dealsData[i][1] || '').toLowerCase().trim()  // col B
    const rowClient = String(dealsData[i][8] || '').toLowerCase().trim()  // col I
    const match =
      (qboName && (rowQbo === qboName || rowClient === qboName)) ||
      (altName && (rowQbo === altName || rowClient === altName))
    if (match) {
      dealsSheet.getRange(i + 1, DEALS_DELETED_COL).setValue(true)
      dealsFlagged++
      // no break — flag every matching row for this customer
    }
  }

  // --- 2. Flag related rows in 📜 Payout Events (Deleted = column S = col 19) ---
  const PE_DELETED_COL = 19  // 1-based (S)
  const payoutSheet = ss.getSheetByName('📜 Payout Events') || ss.getSheetByName('Payout Events')
  if (!payoutSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: '📜 Payout Events sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const peData = payoutSheet.getDataRange().getValues()
  let peFlagged = 0

  for (let j = 1; j < peData.length; j++) {
    const pClient   = String(peData[j][4] || '').toLowerCase().trim()  // col E
    const pConsumer = String(peData[j][3] || '').toLowerCase().trim()  // col D
    const pOrder    = String(peData[j][1] || '').toLowerCase().trim()  // col B
    const match =
      (qboName  && pClient === qboName) ||
      (altName  && pClient === altName) ||
      (merchant && pConsumer === merchant) ||
      (contract && pOrder === contract)
    if (match) {
      payoutSheet.getRange(j + 1, PE_DELETED_COL).setValue(true)
      peFlagged++
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      dealsFlagged: dealsFlagged,
      transactionsFlagged: peFlagged
    }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ============================================
// EDIT DEAL TERMS
// Updates the raw sheet-backed deal fields (Loan Amount, Payback, Origination
// Amount, Per-Transaction Payment, Funded Date, Payment Frequency). Paid, Fee,
// Status, Progress and Balance are NOT touched here — the React app always
// recomputes those from Payout Events on the next fetch, so writing them here
// would just be overwritten and drift out of sync.
// ============================================
function handleUpdateDeal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const deal = data.deal || {}
  const updates = data.updates || {}

  const dealsSheet = ss.getSheetByName('💼 Deals')
  if (!dealsSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: '💼 Deals sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const dealsData = dealsSheet.getDataRange().getValues()
  const targetQbo = String(deal.qbo_customer_name || '').toLowerCase().trim()
  const targetClient = String(deal.client_name || '').toLowerCase().trim()

  let dealRow = -1
  for (let i = 1; i < dealsData.length; i++) {
    const rowQbo = String(dealsData[i][1] || '').toLowerCase().trim()     // col B
    const rowClient = String(dealsData[i][8] || '').toLowerCase().trim()  // col I
    if ((targetQbo && (rowQbo === targetQbo || rowClient === targetQbo)) ||
        (targetClient && (rowQbo === targetClient || rowClient === targetClient))) {
      dealRow = i + 1
      break
    }
  }

  if (dealRow === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Deal not found: ' + (deal.qbo_customer_name || deal.client_name) }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const updatedFields = []

  if (updates.receivables_purchased_amount !== undefined && updates.receivables_purchased_amount !== '') {
    dealsSheet.getRange(dealRow, 4).setValue(Number(updates.receivables_purchased_amount))  // col D
    updatedFields.push('receivables_purchased_amount')
  }
  if (updates.purchase_price !== undefined && updates.purchase_price !== '') {
    dealsSheet.getRange(dealRow, 7).setValue(Number(updates.purchase_price))  // col G
    updatedFields.push('purchase_price')
  }
  if (updates.last_payment_amount !== undefined && updates.last_payment_amount !== '') {
    dealsSheet.getRange(dealRow, 19).setValue(Number(updates.last_payment_amount))  // col S
    updatedFields.push('last_payment_amount')
  }
  if (updates.syndicated_amount_origination !== undefined && updates.syndicated_amount_origination !== '') {
    dealsSheet.getRange(dealRow, 23).setValue(Number(updates.syndicated_amount_origination))  // col W
    updatedFields.push('syndicated_amount_origination')
  }
  if (updates.payment_frequency !== undefined && updates.payment_frequency !== '') {
    dealsSheet.getRange(dealRow, 24).setValue(updates.payment_frequency)  // col X
    updatedFields.push('payment_frequency')
  }
  if (updates.funded_date) {
    // "YYYY-MM-DD" -> local Date built from components (avoids UTC day-shift)
    const parts = String(updates.funded_date).split('-')
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    dealsSheet.getRange(dealRow, 6).setValue(d)  // col F
    updatedFields.push('funded_date')
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, updatedFields: updatedFields }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ============================================
// ADD NEW DEAL
// Appends a brand-new row to 💼 Deals with sane defaults (Principal Collected
// = $0, Fee Collected = $0, Status = Active, Deleted = FALSE) so it shows up
// in the app immediately and starts collecting through the normal waterfall.
// Rejects the request if an active deal with the same client name already
// exists, since client name is the join key everything else matches on.
// ============================================
function handleAddDeal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const deal = data.deal || {}

  const clientName = String(deal.client_name || deal.qbo_customer_name || '').trim()
  if (!clientName) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Client name is required' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const dealsSheet = ss.getSheetByName('💼 Deals')
  if (!dealsSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: '💼 Deals sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  // Reject duplicates — client name is the join key the whole app matches on
  const dealsData = dealsSheet.getDataRange().getValues()
  const key = clientName.toLowerCase()
  for (let i = 1; i < dealsData.length; i++) {
    const rowQbo = String(dealsData[i][1] || '').toLowerCase().trim()    // col B
    const rowClient = String(dealsData[i][8] || '').toLowerCase().trim() // col I
    const rowDeleted = dealsData[i][24] === true                          // col Y
    if (!rowDeleted && (rowQbo === key || rowClient === key)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'A deal for "' + clientName + '" already exists' }))
        .setMimeType(ContentService.MimeType.JSON)
    }
  }

  // "YYYY-MM-DD" -> local Date built from components (avoids UTC day-shift)
  let fundedDate = new Date()
  if (deal.funded_date) {
    const parts = String(deal.funded_date).split('-')
    fundedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  }
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy hh:mm a')

  const newRow = [
    deal.qbo_customer_id || '',                       // A  QBO Customer ID
    clientName,                                        // B  QBO Customer Name
    deal.contract_id || '',                            // C  Contract ID
    Number(deal.receivables_purchased_amount) || 0,    // D  Receivables Purchased Amount (Payback)
    deal.actum_merchant_id || '',                      // E  Actum Merchant ID
    fundedDate,                                         // F  Funded Date
    Number(deal.purchase_price) || 0,                   // G  Purchase Price (Loan Amount)
    deal.deal_id || '',                                 // H  Deal ID
    clientName,                                         // I  Client Name
    0,                                                   // J  Principal Collected
    'Active',                                            // K  Status
    fundedDate,                                          // L  Funded Date (duplicate)
    '',                                                  // M  Expected Amount
    '',                                                  // N  Expected Amount Low
    '',                                                  // O  Expected Amount High
    now,                                                 // P  Updated Date
    '',                                                  // Q  Last QBO JE
    '',                                                  // R  Last Payment Date
    Number(deal.last_payment_amount) || 0,               // S  Last Payment Amount
    '',                                                   // T  Last HistoryKey ID
    0,                                                     // U  Fee Collected
    deal.customer_email || '',                             // V  Customer Email
    Number(deal.syndicated_amount_origination) || 0,        // W  Syndicated Amount - Origination
    deal.payment_frequency || 'Business Day',                // X  Payment Frequency
    false                                                     // Y  Deleted
  ]
  dealsSheet.appendRow(newRow)

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, row: dealsSheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

## Testing Checklist

1. Log in as an admin user in the React app.
2. Go to **Advances**. Click the `⋮` Actions menu on any deal → **Edit Deal Terms**.
3. Change the **Loan Amount** (and/or Payback, Origination, Per-Transaction, Date, Frequency) → **Save Changes**.
4. Within ~60s (next auto-refresh) or after a manual refresh:
   - **Syndicated** column reflects the new Loan Amount.
   - **Factor**, **Origination Fee**, **Payback**, **Balance**, **Progress**, **Est. Payoff** all recompute to match.
5. Open the spreadsheet directly and confirm the 💼 Deals row's columns D/F/G/S/W/X were updated.

### Add Deal

1. Log in as an admin user. Go to **Advances** → click **Add Deal** (top right).
2. Fill in Client Name, Loan Amount, Total Payback, Funded Date → **Add Deal**.
3. Try submitting a second deal with the exact same Client Name — the modal should block it client-side with "An active deal for this client already exists" before it ever reaches the sheet.
4. Within ~60s (next auto-refresh) or after a manual refresh, the new deal appears in the Advances table as **Active** with $0 Paid, $0 Fee, matching the Loan Amount / Payback you entered.
5. Open the spreadsheet directly and confirm a new row was appended to 💼 Deals with columns A–Y populated per the table above.

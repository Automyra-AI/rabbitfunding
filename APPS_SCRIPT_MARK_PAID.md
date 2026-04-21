# Apps Script — "Mark as Paid in Full" Handler

The frontend "Mark as Paid in Full" admin action posts to the existing Apps Script
Web App URL with `action: "markDealPaidInFull"`. Add the handler below to your
deployed Apps Script so the sheet actually writes.

## Payload Shape (sent by frontend)

```json
{
  "action": "markDealPaidInFull",
  "historyKeyId": "MANUAL-1719200000000",
  "deal": {
    "qbo_customer_id": "589",
    "qbo_customer_name": "CENTRAL TEXAS COMMERCIAL BUILDERS",
    "client_name": "CENTRAL TEXAS COMMERCIAL BUILDERS",
    "contract_id": "...",
    "deal_id": "...",
    "actum_merchant_id": "dODSEr1MhHjr2OAr7aL74fh8hb.t.UtN"
  },
  "payment": {
    "amount": 5500,
    "method": "Zelle",
    "note": "Confirmation #ABC123",
    "date": "2026-04-21"
  }
}
```

## What the Handler Must Do

1. **Append a row to the Payout Events sheet** so the waterfall math picks it up:
   - Column A (History KeyID) = `historyKeyId` (e.g. `MANUAL-...`)
   - Column D (Consumer Unique ID) = `deal.actum_merchant_id`
   - Column E (Client Name) = `deal.qbo_customer_name` (or `client_name`)
   - Column F (Amount) = `payment.amount`
   - Column I (Transaction Date) = `payment.date`
   - Column J (Processed Date) = today's timestamp
   - Column M (Match Method) = `"Manual - " + payment.method + (note ? " | " + note : "")`
   - Column P (Transaction Type) = `"Debit"` (so it is NOT filtered as a settlement confirmation)
   - Column Q (Reference Key ID) = empty
   - Column R (Manual Status Override) = `"settled"` ← critical: makes the frontend treat it as settled immediately

2. **Update the Deals sheet**: find the row whose `QBO Customer Name` (col B) or
   `Client Name` (col I) matches, then set `Status` (col K) to `"PaidOff"`.

## Reference Handler Code

Paste this into your Apps Script project alongside the existing `updatePayoutEvent`
logic. The `doPost` entry point should route by `data.action`.

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'updatePayoutEvent') {
      return handleUpdatePayoutEvent(data); // your existing handler
    }

    if (data.action === 'markDealPaidInFull') {
      return handleMarkDealPaidInFull(data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: 'Unknown action: ' + data.action
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleMarkDealPaidInFull(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- 1. Append manual settled row to Payout Events ---
  var payoutSheet = ss.getSheetByName('📜 Payout Events');
  var payment = data.payment || {};
  var deal = data.deal || {};
  var methodLabel = 'Manual - ' + (payment.method || 'Other');
  if (payment.note) methodLabel += ' | ' + payment.note;

  // Row layout (0-based → 1-based for Apps Script):
  //  A  History KeyID        (index 0)
  //  B  Order ID             (1)
  //  C  SubID                (2)
  //  D  Consumer Unique ID   (3)
  //  E  Client Name          (4)
  //  F  Amount               (5)
  //  G  Principal Applied    (6)  — leave blank, waterfall computes
  //  H  Fee Applied          (7)  — leave blank
  //  I  Transaction Date     (8)
  //  J  Processed Date       (9)
  //  M  Match Method         (12)
  //  P  Transaction Type     (15)
  //  Q  Reference Key ID     (16) — must be empty
  //  R  Manual Status        (17) — "settled"
  var newRow = [
    data.historyKeyId || ('MANUAL-' + Date.now()),
    deal.contract_id || '',
    '',
    deal.actum_merchant_id || '',
    deal.qbo_customer_name || deal.client_name || '',
    payment.amount || 0,
    '', // principal applied (blank, waterfall handles)
    '', // fee applied (blank)
    payment.date || new Date().toISOString().slice(0, 10),
    new Date(),
    '', '', // K, L
    methodLabel,
    '', '', // N, O
    'Debit',
    '', // Q reference key id — MUST be empty
    'settled'
  ];
  payoutSheet.appendRow(newRow);

  // --- 2. Update Deals sheet: find deal and set status to PaidOff ---
  var dealsSheet = ss.getSheetByName('💼 Deals');
  var dealsData = dealsSheet.getDataRange().getValues();
  var header = dealsData[0];

  var qboNameCol = 1;  // col B: QBO Customer Name
  var clientNameCol = 8; // col I: Client Name
  var statusCol = 10;    // col K: Status

  var targetName = (deal.qbo_customer_name || '').toLowerCase().trim();
  var altName = (deal.client_name || '').toLowerCase().trim();

  for (var i = 1; i < dealsData.length; i++) {
    var row = dealsData[i];
    var rowQbo = String(row[qboNameCol] || '').toLowerCase().trim();
    var rowClient = String(row[clientNameCol] || '').toLowerCase().trim();
    if ((targetName && rowQbo === targetName) ||
        (altName && (rowQbo === altName || rowClient === altName))) {
      dealsSheet.getRange(i + 1, statusCol + 1).setValue('PaidOff');
      break;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    historyKeyId: data.historyKeyId
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Why the manual row uses Transaction Type = "Debit" + Override = "settled"

The frontend's `fetchPayoutEvents` filter logic:

- Rows **with** a Reference Key ID are skipped (they are settlement confirmations).
- Rows **without** a Reference Key ID are kept as debits.
- A kept row is marked `isSettled = true` if either:
  - its History Key ID appears as another row's Reference Key ID, **OR**
  - its Manual Status Override (column R) is `"settled"`.

By writing a row with empty Q and `settled` in R, the manual payment shows up as
a settled debit immediately, and the waterfall counts it toward principal/fee.
Once the waterfall applies the full remaining balance, the computed deal status
flips to `PaidOff` in the UI — and the direct write to the Deals sheet keeps the
raw sheet value consistent with what the UI displays.

## Testing Checklist

1. Log in as an admin user.
2. Go to **Deal Management** (Advances page).
3. Click the `⋮` in the new **Actions** column on any active deal.
4. Pick **Mark as Paid in Full** → enter amount, method, date, note → **Record Payment**.
5. Within ~60 s (next auto-refresh) the deal's:
   - Status badge should flip to **Paid Off** (blue).
   - Paid column should equal Payback.
   - Balance column should hit $0.
6. Open the spreadsheet directly:
   - New manual row should appear at the bottom of 📜 Payout Events (Transaction Type = Debit, column R = `settled`).
   - 💼 Deals Status cell for that deal should read `PaidOff`.

# Apps Script — "Delete Deal" (Soft Delete) Handler

The frontend "Delete Deal" admin action posts to the existing Apps Script Web App
URL with `action: "deleteDeal"`. This is a **soft delete** — nothing is removed
from the spreadsheet. Instead a `Deleted` flag is set to `TRUE` on:

1. The matching row in the **💼 Deals** sheet, and
2. **Every** related row in the **📜 Payout Events** sheet (the deal's transactions).

The frontend (`fetchDealsData` / `fetchPayoutEvents`) then hides any row whose
`Deleted` cell is `TRUE`, so the whole customer and its transactions disappear
from the app while staying recoverable in the sheet.

## Required new columns

Add a header named `Deleted` to **both** sheets (any existing TRUE/empty values
are respected). The frontend reads them by fixed position, so add them here:

- **💼 Deals** sheet → column **Y** (index 24, the column right after `Payment Frequency`)
- **📜 Payout Events** sheet → column **S** (index 18, the column right after `Manual Status Override`)

A cell is treated as deleted when it equals `TRUE` / `true` / `yes` / `1`.
Empty / `FALSE` = active (shown in the app).

## Payload Shape (sent by frontend)

```json
{
  "action": "deleteDeal",
  "deal": {
    "qbo_customer_id": "589",
    "qbo_customer_name": "CENTRAL TEXAS COMMERCIAL BUILDERS",
    "client_name": "CENTRAL TEXAS COMMERCIAL BUILDERS",
    "contract_id": "...",
    "deal_id": "...",
    "actum_merchant_id": "dODSEr1MhHjr2OAr7aL74fh8hb.t.UtN"
  }
}
```

## Reference Handler Code

Add the route to your existing `doPost`, then paste `handleDeleteDeal` alongside
the other handlers.

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'updatePayoutEvent')   return handleUpdatePayoutEvent(data);
    if (data.action === 'markDealPaidInFull')   return handleMarkDealPaidInFull(data);
    if (data.action === 'deleteDeal')           return handleDeleteDeal(data);

    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: 'Unknown action: ' + data.action
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleDeleteDeal(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var deal = data.deal || {};

  var qboName  = String(deal.qbo_customer_name || '').toLowerCase().trim();
  var altName  = String(deal.client_name || '').toLowerCase().trim();
  var merchant = String(deal.actum_merchant_id || '').toLowerCase().trim();
  var contract = String(deal.contract_id || '').toLowerCase().trim();

  // --- 1. Flag the deal row in 💼 Deals (Deleted = column Y / index 24) ---
  var DEALS_DELETED_COL = 25; // 1-based column number (Y)
  var dealsSheet = ss.getSheetByName('💼 Deals');
  var dealsData = dealsSheet.getDataRange().getValues();
  var qboNameCol = 1;    // col B: QBO Customer Name
  var clientNameCol = 8; // col I: Client Name
  var dealsFlagged = 0;

  for (var i = 1; i < dealsData.length; i++) {
    var row = dealsData[i];
    var rowQbo    = String(row[qboNameCol] || '').toLowerCase().trim();
    var rowClient = String(row[clientNameCol] || '').toLowerCase().trim();
    var match =
      (qboName && (rowQbo === qboName || rowClient === qboName)) ||
      (altName && (rowQbo === altName || rowClient === altName));
    if (match) {
      dealsSheet.getRange(i + 1, DEALS_DELETED_COL).setValue(true);
      dealsFlagged++;
      // no break — flag every matching deal row for this customer
    }
  }

  // --- 2. Flag related transactions in 📜 Payout Events (Deleted = column S / index 18) ---
  var PE_DELETED_COL = 19; // 1-based column number (S)
  var payoutSheet = ss.getSheetByName('📜 Payout Events');
  var peData = payoutSheet.getDataRange().getValues();
  var orderIdCol = 1;          // col B: Order ID (we write contract_id here on manual rows)
  var consumerCol = 3;         // col D: Consumer Unique ID (actum_merchant_id)
  var peClientCol = 4;         // col E: Client Name
  var peFlagged = 0;

  for (var j = 1; j < peData.length; j++) {
    var prow = peData[j];
    var pClient   = String(prow[peClientCol] || '').toLowerCase().trim();
    var pConsumer = String(prow[consumerCol] || '').toLowerCase().trim();
    var pOrder    = String(prow[orderIdCol] || '').toLowerCase().trim();
    var match =
      (qboName  && pClient === qboName) ||
      (altName  && pClient === altName) ||
      (merchant && pConsumer === merchant) ||
      (contract && pOrder === contract);
    if (match) {
      payoutSheet.getRange(j + 1, PE_DELETED_COL).setValue(true);
      peFlagged++;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    dealsFlagged: dealsFlagged,
    transactionsFlagged: peFlagged
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## How matching works

A Payout Events row is considered "related" to the deleted deal if **any** of
these match (case-insensitive):

- Client Name (col E) == the deal's QBO Customer Name or Client Name
- Consumer Unique ID (col D) == the deal's `actum_merchant_id`
- Order ID (col B) == the deal's `contract_id`

This covers both Actum-imported transactions (matched by merchant id / client)
and manual "Mark as Paid" rows (which carry `contract_id` in Order ID).

## Restoring a deleted deal

Open the spreadsheet and clear (or set to `FALSE`) the `Deleted` cell on the
deal row in **💼 Deals** and on its rows in **📜 Payout Events**. On the next
auto-refresh (~60 s) the deal and its transactions reappear in the app.

## Testing Checklist

1. Add the `Deleted` header to **💼 Deals** (col Y) and **📜 Payout Events** (col S).
2. Log in as an admin user.
3. Go to **Deal Management** (Advances page).
4. Click the `⋮` Actions menu on a deal → **Delete Deal**.
5. Type `DELETE` to confirm → **Delete Deal**.
6. Within ~60 s (next auto-refresh):
   - The deal disappears from the Advances table.
   - Its transactions disappear from the Ledger.
7. Open the spreadsheet directly:
   - 💼 Deals `Deleted` cell for that deal == `TRUE`.
   - 📜 Payout Events `Deleted` cell == `TRUE` on every related row.

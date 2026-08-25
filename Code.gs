/**
 * TAMIZHAN BAKERY — Google Apps Script backend
 * ---------------------------------------------------------------
 * FASTEST, MOST RELIABLE SETUP (recommended — do this for a brand-new sheet):
 *   1. Go to sheets.google.com -> Blank spreadsheet. Rename it
 *      "Tamizhan Bakery Orders" (or anything you like).
 *   2. In that sheet: Extensions -> Apps Script.
 *      (Opening it THIS way binds the script to THIS sheet automatically —
 *      leave SHEET_ID below blank and it just works, no IDs to copy.)
 *   3. Delete the placeholder code, paste this whole file in.
 *   4. Click ▶ Run once (pick "setupSheet" from the dropdown first) to
 *      approve permissions and write the header row immediately.
 *      (Even if you skip this, headers auto-write on the first order.)
 *   5. Deploy -> New deployment -> type "Web app":
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy, copy the generated .../exec URL.
 *   6. Paste that URL into WEBAPP_URL in js/app.js, save, redeploy the site.
 *
 * Sheet column order (auto-written to row 1):
 *   A Order ID | B Timestamp | C Customer Name | D Phone Number
 *   E Street Address | F City | G Pincode | H Landmark
 *   I Ordered Items | J Cake Message | K Add-ons | L Total Amount (₹)
 *   M Payment Mode | N Delivery Time Slot | O Order Status | P Delivery Status
 * ---------------------------------------------------------------
 */

const SHEET_ID = ""; // Leave BLANK if you opened this script via Extensions -> Apps Script
                      // from inside the sheet (recommended, step 2 above). Only fill this
                      // in if you're using a standalone script pointed at an existing sheet
                      // — paste the long ID from that sheet's URL between /d/ and /edit.
const SHEET_NAME = "Orders"; // tab name the script writes to

function getSheet_() {
  // Bound script (opened via the sheet's Extensions menu) -> use the active
  // spreadsheet. Standalone script with an explicit ID -> open that instead.
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) writeHeaders_(sheet); // guarantee row 1 always has headers
  return sheet;
}

function writeHeaders_(sheet) {
  const headers = [
    "Order ID", "Timestamp", "Customer Name", "Phone Number",
    "Street Address", "City", "Pincode", "Landmark",
    "Ordered Items", "Cake Message", "Add-ons", "Total Amount (₹)",
    "Payment Mode", "Delivery Time Slot", "Order Status", "Delivery Status"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * Run this manually from the Apps Script editor (select it in the function
 * dropdown, then click ▶ Run) to prove the script CAN write to the sheet,
 * independent of the website / deployment. If this writes a test row but
 * your website orders still don't appear, the problem is deployment
 * (redeploy needed, or wrong URL in js/app.js) — not the sheet or script.
 */
function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        orderId: "TB-CH-TEST",
        name: "Test Customer",
        phone: "9876543210",
        address: "12 Test Street",
        pincode: "600001",
        items: "Truffle Overload (1kg) x1",
        total: 1299,
        slot: "24/08/2026 PM",
      }),
    },
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent()); // View > Logs to see the result
}

/** Optional: run manually to write/confirm the header row immediately
 *  (headers also auto-write on the very first order regardless). */
function setupSheet() {
  writeHeaders_(getSheet_());
}

/** Frontend -> Sheet: append a new order row. Every column is guaranteed
 *  a non-blank value — optional fields fall back to "N/A" / "None" instead
 *  of being left empty. */
function doPost(e) {
  try {
    const sheet = getSheet_();
    const body = JSON.parse(e.postData.contents);

    sheet.appendRow([
      body.orderId || ("TB-CH-" + Math.floor(1000 + Math.random() * 9000)),
      body.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy HH:mm:ss"),
      body.name || "N/A",
      body.phone || "N/A",
      body.address || "N/A",
      body.city || "Chennai",
      body.pincode || "N/A",
      body.landmark || "N/A",
      body.items || "N/A",
      body.cakeMessage || "No message",
      body.addons || "None",
      body.total || 0,
      body.paymentMode || "Cash on Delivery",
      body.slot || "N/A",
      body.orderStatus || "Ordered",
      body.deliveryStatus || "Not Delivered",
    ]);

    return jsonResponse_({ success: true, orderId: body.orderId });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

/** Sheet -> Frontend: look up an order by orderId or phone for live tracking. */
function doGet(e) {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const rows = values.slice(1);

    const orderIdQuery = e.parameter.orderId;
    const phoneQuery = e.parameter.phone;

    const col = (name) => headers.indexOf(name);

    let match = null;
    for (const row of rows) {
      if (orderIdQuery && row[col("Order ID")] == orderIdQuery) { match = row; break; }
      if (phoneQuery && String(row[col("Phone Number")]) == String(phoneQuery)) { match = row; } // last match = most recent order
    }

    if (!match) return jsonResponse_({ error: "Order not found" });

    const result = {
      orderId: match[col("Order ID")],
      timestamp: match[col("Timestamp")],
      name: match[col("Customer Name")],
      phone: match[col("Phone Number")],
      items: match[col("Ordered Items")],
      total: match[col("Total Amount (₹)")],
      slot: match[col("Delivery Time Slot")],
      orderStatus: match[col("Order Status")],
      deliveryStatus: match[col("Delivery Status")],
    };
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

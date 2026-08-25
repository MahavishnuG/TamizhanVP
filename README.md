# Tamizhan Bakery — Website

A responsive, no-build-step website (HTML/CSS/vanilla JS) for Tamizhan Bakery,
Chennai — cakes catalog, custom cake builder, celebration add-ons store,
cart + checkout, and live order tracking synced two-way with a Google Sheet.

## What's inside
```
index.html            All pages (Home, Catalog, Customise, Celebration Store,
                       About, Track Order) — routed client-side, no reload.
css/styles.css         Design tokens + all styling, mobile-first responsive.
js/data.js              Product catalog, add-ons and FAQ data — edit here.
js/app.js                Cart, checkout, validation, Sheets sync, AI widget,
                       WhatsApp link, hero carousel.
apps-script/Code.gs     Google Apps Script backend (doPost / doGet).
```
No npm install, no build step — open `index.html` in a browser, or host the
folder on any static host (Netlify, Vercel, GitHub Pages, Apps Script's own
`HtmlService`, etc).

## 1. Set up a brand-new Google Sheet backend (start clean)
1. Go to **sheets.google.com → Blank spreadsheet**. Rename it, e.g.
   "Tamizhan Bakery Orders".
2. **From inside that sheet:** `Extensions → Apps Script`. Doing it this
   way binds the script to this exact sheet — no ID copying, no
   ambiguity, this is the #1 fix for "orders don't show up."
3. Delete the placeholder code and paste in `apps-script/Code.gs` (leave
   `SHEET_ID` blank, as shipped — that's what makes step 2 work).
4. Pick **`setupSheet`** from the function dropdown and click ▶ **Run**.
   The first run asks you to authorize — click through **Review
   permissions → (your account) → Advanced → Go to project (unsafe) →
   Allow** (it's your own script, this warning is normal for
   unpublished Apps Script projects). After this, row 1 of the **Orders**
   tab will have all 16 headers, bold and frozen.
   - Headers also auto-write the moment the first real order arrives,
     even if you skip this step — but running it once lets you confirm
     everything works before going live.
5. `Deploy → New deployment → type: Web app`.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**, then **Authorize access** again if prompted.
6. Copy the `.../exec` URL you're given.
7. Open `js/app.js`, replace `WEBAPP_URL`'s placeholder value with that
   URL, save.

Whenever you edit the script afterwards, you must **redeploy** (Deploy →
Manage deployments → ✏️ → Version: New version → Deploy) for changes to
go live at the same URL — saving alone does nothing.

### Confirm it's working, end to end
1. In Apps Script, run **`testDoPost`** — check the sheet for a
   `TB-CH-TEST` row under the headers.
2. Open the website, place one real test order, and refresh the sheet —
   a new row should appear with every column filled (never blank).
3. Go to **Track Order** on the site and search that Order ID — it
   should read live from the sheet.

### Order Status / Delivery Status workflow
Your staff manage fulfilment directly in the Sheet:
- Column **O (Order Status)**: `Ordered` (default) → change to `Cancelled`
  to cancel an order.
- Column **P (Delivery Status)**: `Not Delivered` (default) → change to
  `Delivered` once it's out the door.
The Track Order page polls this on demand, so updates appear next time the
customer refreshes or re-searches their Order ID.

> **Note on `no-cors` submits:** Apps Script web apps don't return CORS
> headers to `fetch()`, so the order-submit POST is sent with
> `mode: "no-cors"` — this means the browser can't read the response, but
> the row is written correctly. The app also stores a local copy of the
> order (`localStorage`) so Track Order still works instantly even before
> you've confirmed the Sheets round-trip; for a production-grade guarantee
> you'd add a queue/retry (see "Next steps" below).

### Still not showing up? Check these in order
1. **Confirm `SHEET_ID` is blank** in `Code.gs` if you followed step 2
   above (Extensions → Apps Script from inside the sheet). A leftover ID
   from a different sheet will silently write to the wrong place.
2. **Redeploy after any script edit** — Deploy → Manage deployments →
   ✏️ → New version → Deploy.
3. **Deployment access must say "Anyone"** — not "Anyone with Google
   account" or "Only myself".
4. **`WEBAPP_URL` in `js/app.js` must match your current `/exec` URL
   exactly** — a *new* deployment (not a new version) generates a new URL.
5. **Open DevTools → Network** while placing a test order — confirm a
   POST actually fires to your `/exec` URL (you won't see the response
   body because of `no-cors`, but you can confirm the request left).

## 2. Configure WhatsApp
Set `WHATSAPP_NUMBER` in `js/app.js` to your real number in
`91XXXXXXXXXX` format (no `+`, no spaces). Update the `tel:` link in
`index.html`'s footer (`#foot-call`) with your bakery's phone number too.

## 3. Replace placeholder content
- **Product photos:** `js/data.js` currently uses royalty-free Unsplash
  stock photography as placeholders so the site is fully browsable out of
  the box. Swap each `img` URL for your own product photography before
  launch.
- **Prices:** base prices in `js/data.js` are per 0.5 kg; 1 kg and 2 kg
  prices are calculated automatically via `WEIGHT_MULTIPLIER` in
  `js/app.js`. Adjust the multiplier or hardcode per-weight prices if your
  pricing isn't linear.
- **About Us timeline / copy:** edit directly in `index.html` under
  `#page-about`.

## 4. The "AI Cake Assistant"
The floating 💬 widget ships as a **lightweight rule-based FAQ assistant**
(`AI_FAQ` in `js/data.js`, matched in `answerFAQ()` in `js/app.js`) —
it needs no API key and works entirely client-side, which keeps this a
static site. If you want true LLM-powered recommendations:
1. Never call an LLM API directly from the browser with a secret key —
   keys embedded in frontend JS are always extractable.
2. Add a small serverless function (Cloudflare Worker / Vercel function /
   an Apps Script `doPost` action) that holds your API key and proxies
   requests to your model of choice.
3. Point `chatSend()` in `js/app.js` at that endpoint instead of
   `answerFAQ()`.

## 5. Deploying
Any static host works:
- **Netlify / Vercel:** drag-and-drop the folder, or connect a Git repo.
- **GitHub Pages:** push the folder to a repo, enable Pages on `main`.
- Just make sure `WEBAPP_URL` points at your deployed Apps Script, and
  that the Apps Script deployment's access is set to "Anyone".

## Next steps / production hardening
- Add a retry queue (e.g. re-POST on next page load) for orders that fail
  to sync while offline.
- Add server-side validation in `Code.gs` (phone/pincode format) since
  client-side validation alone can be bypassed.
- Consider moving inventory/pricing to the Sheet too, with a `doGet`
  action the frontend calls on load, so non-technical staff can update
  prices without touching code.
- Add image compression/upload-to-Drive for the custom cake reference
  photo (currently kept in-browser only, not sent to the Sheet).

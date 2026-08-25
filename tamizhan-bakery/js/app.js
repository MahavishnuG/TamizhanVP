/* ===========================================================
   TAMIZHAN BAKERY — App logic
   Replace WEBAPP_URL and WHATSAPP_NUMBER below before going live.
   =========================================================== */

// -----------------------------------------------------------------
// CONFIG — edit these two lines for your deployment
// -----------------------------------------------------------------
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw5BM1Xs5cU_5vEKC1UZqUNYWBmDw043S8536PjVwDqWQoqR4PNUy_WvNp95Yu2S7-4/exec"; // <-- from Deploy > New deployment, step 5 in Code.gs
const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // <-- put the real 91-prefixed WhatsApp number here

// -----------------------------------------------------------------
// STATE
// -----------------------------------------------------------------
let cart = JSON.parse(localStorage.getItem("tb_cart") || "[]");
let selectedWeights = {}; // productId -> "0.5kg" | "1kg" | "2kg"
let activeCategory = "bestseller";
let uploadedRefImage = null;

function saveCart(){ localStorage.setItem("tb_cart", JSON.stringify(cart)); renderCartBadge(); }
function rupee(n){ return "₹" + Math.round(n).toLocaleString("en-IN"); }

// dd/mm/yyyy HH:mm:ss — matches the Google Sheet's Timestamp column format
function formatTimestamp(){
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
// <input type="date"> gives yyyy-mm-dd — convert to dd/mm/yyyy for the sheet
function formatDateDDMMYYYY(isoDate){
  const [y,m,d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

// -----------------------------------------------------------------
// ROUTER (hash based single-page navigation)
// -----------------------------------------------------------------
function goTo(route){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page-" + route);
  if (el) el.classList.add("active");
  document.querySelectorAll("nav.links a, .mobile-drawer nav a").forEach(a=>{
    a.classList.toggle("active", a.dataset.route === route);
  });
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
  window.location.hash = route;
  if (route === "track") prefillTrackFromQuery();
}
window.addEventListener("hashchange", () => {
  const r = window.location.hash.replace("#","") || "home";
  goTo(r);
});

// -----------------------------------------------------------------
// TOAST
// -----------------------------------------------------------------
let toastTimer;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), 2600);
}

// -----------------------------------------------------------------
// RENDER: product cards
// -----------------------------------------------------------------
function weightPrice(base, w){ return Math.round(base * WEIGHT_MULTIPLIER[w]); }

function productCard(p){
  const w = selectedWeights[p.id] || "0.5kg";
  const eggClass = p.egg === "eggless" ? "veg" : "egg";
  const eggLabel = p.egg === "eggless" ? "Eggless" : "Contains Egg";
  return `
  <div class="card" data-id="${p.id}">
    <div class="thumb">
      <span class="egg-badge ${eggClass}">${eggLabel}</span>
      <img src="${p.img}" alt="${p.name}" loading="lazy">
    </div>
    <div class="body">
      <h4>${p.name}</h4>
      <p class="desc">${p.desc}</p>
      <div class="weight-row" role="group" aria-label="Select weight for ${p.name}">
        ${["0.5kg","1kg","2kg"].map(wt => `<button type="button" class="weight-pill ${wt===w?'active':''}" data-pid="${p.id}" data-wt="${wt}">${wt}</button>`).join("")}
      </div>
      <div class="card-foot">
        <div class="price">${rupee(weightPrice(p.price,w))}<br><small>incl. taxes</small></div>
        <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to Cart</button>
      </div>
    </div>
  </div>`;
}

function renderCatalog(){
  const grid = document.getElementById("catalog-grid");
  const list = PRODUCTS.filter(p => activeCategory === "all" || p.cat.includes(activeCategory));
  grid.innerHTML = list.map(productCard).join("") || `<p>No cakes in this category yet.</p>`;
}

function renderHomeBestsellers(){
  const grid = document.getElementById("home-bestseller-grid");
  grid.innerHTML = PRODUCTS.filter(p=>p.cat.includes("bestseller")).slice(0,4).map(productCard).join("");
}

function renderAddons(){
  const grid = document.getElementById("addon-grid");
  grid.innerHTML = ADDONS.map(a => `
    <div class="card" data-id="${a.id}">
      <div class="thumb"><img src="${a.img}" alt="${a.name}" loading="lazy"></div>
      <div class="body">
        <h4>${a.name}</h4>
        <div class="card-foot">
          <div class="price">${rupee(a.price)}</div>
          <button class="btn btn-primary btn-sm" data-add-addon="${a.id}">Add</button>
        </div>
      </div>
    </div>`).join("");
}

// -----------------------------------------------------------------
// CART
// -----------------------------------------------------------------
function addToCart(pid, weight){
  const p = PRODUCTS.find(x=>x.id===pid);
  if(!p) return;
  const w = weight || selectedWeights[pid] || "0.5kg";
  const key = pid + "_" + w;
  const existing = cart.find(c=>c.key===key);
  if(existing){ existing.qty += 1; }
  else {
    cart.push({ key, id:pid, type:"cake", name:p.name, weight:w, unitPrice: weightPrice(p.price,w), qty:1, img:p.img });
  }
  saveCart();
  toast(`${p.name} (${w}) added to cart`);
}

function addAddonToCart(aid){
  const a = ADDONS.find(x=>x.id===aid);
  if(!a) return;
  const existing = cart.find(c=>c.key===aid);
  if(existing){ existing.qty += 1; }
  else cart.push({ key:aid, id:aid, type:"addon", name:a.name, weight:"", unitPrice:a.price, qty:1, img:a.img });
  saveCart();
  toast(`${a.name} added to cart`);
}

function changeQty(key, delta){
  const item = cart.find(c=>c.key===key);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(c=>c.key!==key);
  saveCart();
  renderCartDrawer();
}

function cartTotal(){ return cart.reduce((s,c)=>s + c.unitPrice*c.qty, 0); }
function cartCount(){ return cart.reduce((s,c)=>s + c.qty, 0); }

function renderCartBadge(){
  document.getElementById("cart-count").textContent = cartCount();
}

function renderCartDrawer(){
  const wrap = document.getElementById("cart-items");
  if(cart.length===0){
    wrap.innerHTML = `<div class="empty-note">Your cart is empty.<br>Add a cake to get started 🎂</div>`;
  } else {
    wrap.innerHTML = cart.map(c => `
      <div class="cart-line">
        <img src="${c.img}" alt="">
        <div class="info">
          <div class="t">${c.name}</div>
          <div class="s">${c.weight ? c.weight + " · " : ""}${rupee(c.unitPrice)}</div>
        </div>
        <div class="qty-ctrl">
          <button data-qty="-1" data-key="${c.key}" aria-label="Decrease quantity">−</button>
          <span>${c.qty}</span>
          <button data-qty="1" data-key="${c.key}" aria-label="Increase quantity">+</button>
        </div>
      </div>`).join("");
  }
  document.getElementById("cart-total").textContent = rupee(cartTotal());
  document.getElementById("checkout-btn").disabled = cart.length===0;
}

function toggleCart(open){
  document.getElementById("cart-drawer").classList.toggle("open", open);
  document.getElementById("overlay-dim").classList.toggle("show", open);
  if(open) renderCartDrawer();
}

// -----------------------------------------------------------------
// CHECKOUT MODAL + VALIDATION
// -----------------------------------------------------------------
function openCheckout(){
  if(cart.length===0) return;
  toggleCart(false);
  document.getElementById("checkout-modal").classList.add("open");
  renderCheckoutSummary();
}
function closeCheckout(){ document.getElementById("checkout-modal").classList.remove("open"); }

function renderCheckoutSummary(){
  const el = document.getElementById("checkout-summary");
  el.innerHTML = cart.map(c=>`<div class="cart-line"><img src="${c.img}"><div class="info"><div class="t">${c.name} ${c.weight?`(${c.weight})`:""} × ${c.qty}</div></div><div>${rupee(c.unitPrice*c.qty)}</div></div>`).join("");
  document.getElementById("checkout-total").textContent = rupee(cartTotal());
}

function validateField(id, testFn, msg){
  const field = document.getElementById(id).closest(".field");
  const ok = testFn();
  field.classList.toggle("invalid", !ok);
  if(!ok) field.querySelector(".err").textContent = msg;
  return ok;
}

function validateCheckoutForm(){
  const name = document.getElementById("f-name").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  const addr = document.getElementById("f-address").value.trim();
  const pincode = document.getElementById("f-pincode").value.trim();
  const date = document.getElementById("f-date").value;
  const slot = document.getElementById("f-slot").value;

  let ok = true;
  ok = validateField("f-name", ()=>name.length>=2, "Please enter your full name.") && ok;
  ok = validateField("f-phone", ()=>/^[6-9]\d{9}$/.test(phone), "Enter a valid 10-digit Indian phone number.") && ok;
  ok = validateField("f-address", ()=>addr.length>=6, "Please enter your delivery address.") && ok;
  ok = validateField("f-pincode", ()=>/^\d{6}$/.test(pincode), "Enter a valid 6-digit pincode.") && ok;
  ok = validateField("f-date", ()=>!!date, "Please choose a delivery date.") && ok;
  ok = validateField("f-slot", ()=>!!slot, "Please choose AM or PM.") && ok;
  return ok;
}

function genOrderId(){
  const n = Math.floor(1000 + Math.random()*9000);
  return `TB-CH-${n}`;
}

async function submitOrder(e){
  e.preventDefault();
  if(!validateCheckoutForm()) { toast("Please fix the highlighted fields"); return; }

  const orderId = genOrderId();
  const payload = {
    orderId,
    timestamp: formatTimestamp(),
    name: document.getElementById("f-name").value.trim(),
    phone: document.getElementById("f-phone").value.trim(),
    address: document.getElementById("f-address").value.trim(),
    city: "Chennai",
    pincode: document.getElementById("f-pincode").value.trim(),
    landmark: document.getElementById("f-landmark").value.trim(),
    items: cart.map(c=>`${c.name}${c.weight?` (${c.weight})`:""} x${c.qty}`).join("; "),
    cakeMessage: document.getElementById("f-message").value.trim().slice(0,40),
    addons: cart.filter(c=>c.type==="addon").map(c=>`${c.name} x${c.qty}`).join(", "),
    total: cartTotal(),
    paymentMode: "Cash on Delivery",
    slot: `${formatDateDDMMYYYY(document.getElementById("f-date").value)} ${document.getElementById("f-slot").value}`,
    orderStatus: "Ordered",
    deliveryStatus: "Not Delivered",
  };

  const submitBtn = document.getElementById("place-order-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Placing order…";

  try {
    await fetch(WEBAPP_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script web apps don't return CORS headers to fetch()
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch(err){
    console.error("Order sync failed", err);
    // We still show confirmation locally — see README for retry/queue strategies.
  }

  // Persist locally so Track Order works even before a Sheets round-trip
  const localOrders = JSON.parse(localStorage.getItem("tb_orders") || "{}");
  localOrders[orderId] = payload;
  localStorage.setItem("tb_orders", JSON.stringify(localOrders));

  cart = [];
  saveCart();
  closeCheckout();
  showConfirmation(orderId, payload);

  submitBtn.disabled = false;
  submitBtn.textContent = "Place Order";
  document.getElementById("checkout-form").reset();
}

function showConfirmation(orderId, payload){
  document.getElementById("confirm-order-id").textContent = orderId;
  document.getElementById("confirm-total").textContent = rupee(payload.total);
  document.getElementById("confirm-slot").textContent = payload.slot;
  document.getElementById("confirm-modal").classList.add("open");
}
function closeConfirmation(){ document.getElementById("confirm-modal").classList.remove("open"); }

// -----------------------------------------------------------------
// TRACK ORDER (GET from Apps Script, falls back to local cache)
// -----------------------------------------------------------------
function prefillTrackFromQuery(){
  const params = new URLSearchParams(window.location.search);
  const oid = params.get("orderId");
  if(oid){ document.getElementById("track-input").value = oid; lookupOrder(); }
}

async function lookupOrder(){
  const q = document.getElementById("track-input").value.trim();
  const resultBox = document.getElementById("track-result");
  if(!q){ toast("Enter an Order ID or phone number"); return; }
  resultBox.innerHTML = `<p>Looking up your order…</p>`;

  let data = null;
  try {
    const url = `${WEBAPP_URL}?${/^\d{10}$/.test(q) ? "phone" : "orderId"}=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if(res.ok) data = await res.json();
  } catch(err){
    console.warn("Live tracking fetch failed, falling back to local cache", err);
  }

  if(!data || data.error){
    const local = JSON.parse(localStorage.getItem("tb_orders") || "{}");
    if(local[q]) data = local[q];
  }

  if(!data){
    resultBox.innerHTML = `<div class="track-status"><p>We couldn't find an order matching <b>${q}</b>. Double-check the Order ID (e.g. TB-CH-1024) or the phone number used at checkout.</p></div>`;
    return;
  }
  renderTrackResult(data);
}

function renderTrackResult(d){
  const status = (d.orderStatus || d.orderStatus === "Cancelled") ? d.orderStatus : "Ordered";
  const delivery = d.deliveryStatus || "Not Delivered";
  const cancelled = status === "Cancelled";
  const delivered = delivery === "Delivered";
  const pillClass = cancelled ? "cancelled" : delivered ? "delivered" : "ordered";
  const pillText = cancelled ? "Cancelled" : delivered ? "Delivered" : "Preparing your order";

  document.getElementById("track-result").innerHTML = `
    <div class="track-status">
      <span class="status-pill ${pillClass}">● ${pillText}</span>
      <h4 style="margin-top:14px;">Order ${d.orderId}</h4>
      <p>${d.items || ""}</p>
      <p style="font-size:13px;">Delivery slot: <b>${d.slot || "—"}</b></p>
      <p style="font-size:13px;">Total: <b>${rupee(d.total || 0)}</b> · Cash on Delivery</p>
      ${!cancelled ? `
      <div class="progress-track">
        <div class="progress-step done"><div class="dot"></div>Ordered</div>
        <div class="progress-step ${delivered?'done':''}"><div class="dot"></div>Baking</div>
        <div class="progress-step ${delivered?'done':''}"><div class="dot"></div>Delivered</div>
      </div>` : `<p style="color:var(--crimson);font-weight:600;">This order has been cancelled. Contact us on WhatsApp if this is unexpected.</p>`}
    </div>`;
}

// -----------------------------------------------------------------
// AI CAKE ASSISTANT (lightweight rule-based widget)
// See README for wiring this to a real LLM API via a backend proxy.
// -----------------------------------------------------------------
function toggleChat(open){
  document.getElementById("chat-panel").classList.toggle("open", open);
}
function pushMsg(text, who){
  const body = document.getElementById("chat-body");
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function answerFAQ(text){
  const lower = text.toLowerCase();
  const hit = AI_FAQ.find(f => f.q.some(k => lower.includes(k)));
  return hit ? hit.a : "Thanks for asking! For anything specific to your order, tap 'Chat on WhatsApp' below and our team will help right away. Meanwhile, try asking about delivery areas, eggless options, custom cake lead times, or order tracking.";
}
function chatSend(){
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if(!text) return;
  pushMsg(text, "user");
  input.value = "";
  setTimeout(()=> pushMsg(answerFAQ(text), "bot"), 350);
}

// -----------------------------------------------------------------
// CUSTOMIZER (photo upload + build message)
// -----------------------------------------------------------------
function handleRefUpload(e){
  const file = e.target.files[0];
  const preview = document.getElementById("ref-preview");
  if(!file){ preview.innerHTML=""; return; }
  const reader = new FileReader();
  reader.onload = ev => {
    uploadedRefImage = ev.target.result;
    preview.innerHTML = `<img src="${ev.target.result}" alt="Reference upload" style="max-height:160px;border-radius:10px;">`;
  };
  reader.readAsDataURL(file);
}

function addCustomCakeToCart(){
  const shape = document.getElementById("c-shape").value;
  const flavor = document.getElementById("c-flavor").value;
  const theme = document.getElementById("c-theme").value.trim() || "As per reference";
  const weight = document.getElementById("c-weight").value;
  const base = 899;
  cart.push({
    key: "custom_" + Date.now(),
    id: "custom",
    type: "cake",
    name: `Custom ${flavor} Cake (${shape}) — ${theme}`,
    weight,
    unitPrice: weightPrice(base, weight),
    qty: 1,
    img: uploadedRefImage || "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80",
  });
  saveCart();
  toast("Custom cake added to cart");
}

// -----------------------------------------------------------------
// WHATSAPP DEEP LINK
// -----------------------------------------------------------------
function openWhatsApp(prefill){
  const msg = prefill || "Hi Tamizhan Bakery, I have an inquiry regarding ...";
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

// -----------------------------------------------------------------
// HERO CAROUSEL
// -----------------------------------------------------------------
function initHeroCarousel(){
  const slides = document.querySelectorAll(".cake-stage img");
  const dots = document.querySelectorAll(".stage-dots span");
  if(slides.length<2) return;
  let i = 0;
  setInterval(()=>{
    slides[i].style.opacity = "0";
    dots[i].classList.remove("active");
    i = (i+1) % slides.length;
    slides[i].style.opacity = "1";
    dots[i].classList.add("active");
  }, 3600);
}

// -----------------------------------------------------------------
// EVENT WIRING
// -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderCartBadge();
  renderHomeBestsellers();
  renderCatalog();
  renderAddons();
  initHeroCarousel();

  // initial route
  const startRoute = window.location.hash.replace("#","") || "home";
  goTo(startRoute);

  // nav clicks (delegated)
  document.body.addEventListener("click", (e) => {
    const navEl = e.target.closest("[data-route]");
    if(navEl){ e.preventDefault(); goTo(navEl.dataset.route); closeMobileDrawer(); }

    if(e.target.closest("#cart-toggle")) toggleCart(true);
    if(e.target.closest("#cart-close") || e.target === document.getElementById("overlay-dim")) toggleCart(false);
    if(e.target.closest("#checkout-btn")) openCheckout();
    if(e.target.closest("#checkout-close")) closeCheckout();
    if(e.target.closest("#confirm-close")) closeConfirmation();
    if(e.target.closest("#confirm-track-link")) { closeConfirmation(); goTo("track"); }

    const addBtn = e.target.closest("[data-add]");
    if(addBtn) addToCart(addBtn.dataset.add);
    const addonBtn = e.target.closest("[data-add-addon]");
    if(addonBtn) addAddonToCart(addonBtn.dataset.addAddon);

    const wtBtn = e.target.closest(".weight-pill");
    if(wtBtn){
      selectedWeights[wtBtn.dataset.pid] = wtBtn.dataset.wt;
      renderCatalog(); renderHomeBestsellers();
    }

    const qtyBtn = e.target.closest("[data-qty]");
    if(qtyBtn) changeQty(qtyBtn.dataset.key, parseInt(qtyBtn.dataset.qty,10));

    const chip = e.target.closest(".chip");
    if(chip){
      activeCategory = chip.dataset.cat;
      document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("active", c===chip));
      renderCatalog();
    }

    if(e.target.closest("#menu-toggle")) openMobileDrawer();
    if(e.target.closest("#drawer-close") || e.target.id === "mobile-drawer") closeMobileDrawer();

    if(e.target.closest("#chat-fab")) toggleChat(true);
    if(e.target.closest("#chat-close")) toggleChat(false);
    if(e.target.closest("#chat-send")) chatSend();
    const suggestBtn = e.target.closest("[data-suggest]");
    if(suggestBtn){ document.getElementById("chat-input").value = suggestBtn.textContent; chatSend(); }

    if(e.target.closest("#wa-fab")) openWhatsApp();
    if(e.target.closest("[data-wa-order]")) openWhatsApp(`Hi Tamizhan Bakery, I'd like help with order ${document.getElementById("confirm-order-id").textContent}`);

    if(e.target.closest("#track-btn")) lookupOrder();
    if(e.target.closest("#add-custom-btn")) addCustomCakeToCart();
  });

  document.getElementById("checkout-form").addEventListener("submit", submitOrder);
  document.getElementById("ref-upload").addEventListener("change", handleRefUpload);
  document.getElementById("chat-input").addEventListener("keydown", e => { if(e.key==="Enter") chatSend(); });
  document.getElementById("track-input").addEventListener("keydown", e => { if(e.key==="Enter") lookupOrder(); });
  document.getElementById("global-search").addEventListener("keydown", e => {
    if(e.key==="Enter"){ goTo("catalog"); }
  });
});

function openMobileDrawer(){ document.getElementById("mobile-drawer").classList.add("open"); }
function closeMobileDrawer(){ document.getElementById("mobile-drawer").classList.remove("open"); }

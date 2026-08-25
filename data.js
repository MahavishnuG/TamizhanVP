/* ===========================================================
   TAMIZHAN BAKERY — Static catalog data
   Replace `img` URLs with your own product photography.
   Prices are base price for the 0.5kg weight; the app scales
   the price for 1kg / 2kg using `weightMultiplier`.
   =========================================================== */

const WEIGHT_MULTIPLIER = { "0.5kg": 1, "1kg": 1.85, "2kg": 3.5 };

const CATEGORIES = [
  { id: "bestseller", label: "Bestsellers" },
  { id: "chocolate", label: "Chocolate" },
  { id: "fruit", label: "Fruit & Exotic" },
  { id: "heritage", label: "Heritage" },
  { id: "cheesecake", label: "Cheesecakes" },
  { id: "tresleches", label: "Tres Leches" },
  { id: "kids", label: "Kids' Birthday" },
];

const PRODUCTS = [
  { id:"ck-01", name:"Truffle Overload", cat:["bestseller","chocolate"], egg:"eggless", price:699, desc:"Dark Belgian chocolate ganache, cocoa nib crunch.", img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80" },
  { id:"ck-02", name:"Madras Filter Coffee Cake", cat:["bestseller","heritage"], egg:"egg", price:749, desc:"Decoction-soaked sponge, our 1926 house recipe.", img:"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80" },
  { id:"ck-03", name:"Belgian Dark Chocolate", cat:["chocolate"], egg:"eggless", price:649, desc:"Rich 64% cocoa layers, silky chocolate mousse.", img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80" },
  { id:"ck-04", name:"Choco Hazelnut Crunch", cat:["chocolate"], egg:"egg", price:729, desc:"Gianduja cream with roasted hazelnut praline.", img:"https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80" },
  { id:"ck-05", name:"Dutch Truffle", cat:["chocolate","bestseller"], egg:"eggless", price:679, desc:"Classic dark truffle shavings, glossy ganache glaze.", img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80" },
  { id:"ck-06", name:"Fresh Mango Delight", cat:["fruit"], egg:"eggless", price:719, desc:"Alphonso mango cream between vanilla sponge.", img:"https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80" },
  { id:"ck-07", name:"Black Forest Classic", cat:["fruit","bestseller"], egg:"egg", price:649, desc:"Cherry compote, whipped cream, dark chocolate curls.", img:"https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80" },
  { id:"ck-08", name:"Exotic Dragonfruit Mousse", cat:["fruit"], egg:"eggless", price:799, desc:"Layered dragonfruit and lychee mousse.", img:"https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&q=80" },
  { id:"ck-09", name:"Rose Pista Heritage", cat:["heritage"], egg:"eggless", price:759, desc:"Rose-scented cream, candied pistachio, 100-yr recipe.", img:"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80" },
  { id:"ck-10", name:"Jaggery Karupatti Cake", cat:["heritage"], egg:"egg", price:689, desc:"Palm jaggery sponge with roasted coconut.", img:"https://images.unsplash.com/photo-1587248720327-8eb72564be1e?w=600&q=80" },
  { id:"ck-11", name:"Thengai Coconut Bake", cat:["heritage"], egg:"eggless", price:629, desc:"Toasted coconut sponge, coconut milk cream.", img:"https://images.unsplash.com/photo-1606890658317-7c1dd207e7ce?w=600&q=80" },
  { id:"ck-12", name:"New York Baked Cheesecake", cat:["cheesecake","bestseller"], egg:"egg", price:849, desc:"Dense classic bake, buttery biscuit base.", img:"https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80" },
  { id:"ck-13", name:"Blueberry Cheesecake", cat:["cheesecake"], egg:"eggless", price:869, desc:"Wild blueberry compote over vanilla-bean cheese filling.", img:"https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80" },
  { id:"ck-14", name:"Biscoff Cheesecake", cat:["cheesecake"], egg:"eggless", price:899, desc:"Caramelised biscuit swirl, no-bake cheese layer.", img:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80" },
  { id:"ck-15", name:"Classic Tres Leches", cat:["tresleches"], egg:"egg", price:699, desc:"Triple-milk soaked sponge, whipped topping.", img:"https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80" },
  { id:"ck-16", name:"Caramel Tres Leches", cat:["tresleches"], egg:"eggless", price:739, desc:"Salted caramel drizzle over milk-soaked sponge.", img:"https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80" },
  { id:"ck-17", name:"Strawberry Tres Leches", cat:["tresleches"], egg:"eggless", price:749, desc:"Fresh strawberry compote, light cream finish.", img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80" },
  { id:"ck-18", name:"Cartoon Character Cake", cat:["kids","bestseller"], egg:"eggless", price:899, desc:"Fondant-topped, customisable character design.", img:"https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&q=80" },
  { id:"ck-19", name:"Rainbow Sprinkle Cake", cat:["kids"], egg:"egg", price:679, desc:"Funfetti sponge, rainbow sprinkle shell.", img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80" },
  { id:"ck-20", name:"Number & Age Cake", cat:["kids"], egg:"eggless", price:749, desc:"Sculpted number cake with candy trim.", img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80" },
  { id:"ck-21", name:"Unicorn Fantasy Cake", cat:["kids"], egg:"eggless", price:929, desc:"Pastel buttercream mane, edible gold horn.", img:"https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80" },
  { id:"ck-22", name:"Red Velvet Classic", cat:["bestseller","chocolate"], egg:"egg", price:759, desc:"Velvety cocoa sponge, cream-cheese frosting.", img:"https://images.unsplash.com/photo-1586985289906-406988974504?w=600&q=80" },
  { id:"ck-23", name:"Pineapple Fresh Cream", cat:["fruit","heritage"], egg:"eggless", price:599, desc:"Our original 1926 pineapple sponge, house favourite.", img:"https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80" },
  { id:"ck-24", name:"Butterscotch Praline", cat:["bestseller"], egg:"egg", price:669, desc:"Crunchy praline bits folded into butterscotch cream.", img:"https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&q=80" },
];

const ADDONS = [
  { id:"ad-01", name:"Sparkler Candles (Pack of 5)", price:99, img:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" },
  { id:"ad-02", name:"Happy Birthday Topper", price:79, img:"https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400&q=80" },
  { id:"ad-03", name:"Party Popper Duo", price:129, img:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" },
  { id:"ad-04", name:"Birthday Cap Set (x6)", price:149, img:"https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400&q=80" },
  { id:"ad-05", name:"Balloon Bunch (x10)", price:199, img:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" },
  { id:"ad-06", name:"Greeting Card", price:59, img:"https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400&q=80" },
  { id:"ad-07", name:"Snow Spray Can", price:149, img:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" },
  { id:"ad-08", name:"Golden Number Candle", price:89, img:"https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400&q=80" },
];

const AI_FAQ = [
  { q:["delivery area","chennai area","where deliver","service area"], a:"We deliver across Chennai — Adyar, T. Nagar, Anna Nagar, Velachery, OMR, Porur, Mylapore and 40+ other zones. Our 2-hour express slot covers most of the city; enter your pincode at checkout to confirm." },
  { q:["eggless","no egg","without egg"], a:"Most of our cakes have an eggless version — look for the green 'Eggless' badge on each product card. About 60% of our catalog is eggless by default." },
  { q:["ingredient","allergen","gluten","nut"], a:"We bake with fresh dairy, real Belgian/Indian chocolate and seasonal fruit — no artificial preservatives. Please tell us about any nut or gluten allergies in the cake message field and our kitchen team will confirm before baking." },
  { q:["custom","customi","lead time","design cake"], a:"Custom photo-reference cakes need at least 6 hours' lead time (24 hours for elaborate fondant/tiered designs). Upload a reference photo on the Customise page and pick your delivery slot." },
  { q:["track","status","where is my order","order status"], a:"You can track any order on the Track Order page using your Order ID (e.g. TB-CH-1024) or the phone number used at checkout." },
  { q:["2 hour","express","fast delivery","how fast"], a:"Our signature 2-Hour Express Delivery covers ready cakes from the catalog, anywhere in Chennai, placed before 8 PM. Fully custom cakes follow their own lead time." },
  { q:["payment","cod","cash"], a:"We currently accept Cash on Delivery only — pay the delivery partner when your order arrives, no advance payment needed." },
  { q:["anniversary","gift idea","recommend","suggest"], a:"For an anniversary, our Rose Pista Heritage or Belgian Dark Chocolate cakes are popular with a personalised message. For a kid's birthday, the Unicorn Fantasy or Cartoon Character cakes are bestsellers." },
];

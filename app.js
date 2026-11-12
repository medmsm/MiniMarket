const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const state = {
  lang: localStorage.getItem("lang") || "en",
  theme: localStorage.getItem("theme") || "dark",
  selectedProduct: null,
  promoDiscount: 0,
  adminMode: false
};

const dict = {
  en: {
    tagline: "Luxury digital experience",
    limited_offer: "Limited-time offer",
    hero_title: "Gold-standard digital marketplace",
    hero_text: "Premium interface, fast checkout, secure login, and multi-currency payment support.",
    shop_now: "Shop now",
    contact_us: "Contact us",
    offer_ends_in: "Offer ends in",
    auth_title: "Account",
    login: "Login",
    signup: "Sign up",
    logout: "Logout",
    profile_title: "Profile",
    profile_empty: "Login to view your profile and orders.",
    products_title: "Services",
    products_subtitle: "Fixed USD prices with automatic conversion.",
    promo_title: "Promo code",
    apply: "Apply",
    track_title: "Order tracking",
    track: "Track",
    contact_title: "Contact",
    faq_title: "FAQ",
    testimonials_title: "Testimonials",
    policy_title: "Legal",
    checkout_title: "Checkout",
    payment_method: "Payment method",
    confirm_order: "Confirm order",
    invalid_promo: "Invalid promo code.",
    promo_applied: "Promo applied",
    order_saved: "Order saved successfully.",
    order_not_found: "Order not found.",
    invalid_2fa: "Invalid 2FA code."
  },
  ar: {
    tagline: "تجربة رقمية فاخرة",
    limited_offer: "عرض لفترة محدودة",
    hero_title: "سوق رقمي بمستوى فاخر",
    hero_text: "واجهة مميزة، دفع سريع، تسجيل دخول آمن، ودعم متعدد العملات.",
    shop_now: "ابدأ الآن",
    contact_us: "تواصل معنا",
    offer_ends_in: "ينتهي العرض خلال",
    auth_title: "الحساب",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "خروج",
    profile_title: "الملف الشخصي",
    profile_empty: "سجّل الدخول لرؤية ملفك وطلباتك.",
    products_title: "الخدمات",
    products_subtitle: "أسعار ثابتة بالدولار مع تحويل تلقائي.",
    promo_title: "كود الخصم",
    apply: "تطبيق",
    track_title: "تتبع الطلب",
    track: "تتبع",
    contact_title: "التواصل",
    faq_title: "الأسئلة الشائعة",
    testimonials_title: "آراء العملاء",
    policy_title: "القوانين",
    checkout_title: "الدفع",
    payment_method: "طريقة الدفع",
    confirm_order: "تأكيد الطلب",
    invalid_promo: "كود الخصم غير صحيح.",
    promo_applied: "تم تطبيق الخصم",
    order_saved: "تم حفظ الطلب بنجاح.",
    order_not_found: "الطلب غير موجود.",
    invalid_2fa: "رمز التحقق غير صحيح."
  },
  fr: {
    tagline: "Expérience digitale de luxe",
    limited_offer: "Offre limitée",
    hero_title: "Marketplace digitale haut de gamme",
    hero_text: "Interface premium, paiement rapide, connexion sécurisée et multi-devises.",
    shop_now: "Acheter",
    contact_us: "Contact",
    offer_ends_in: "L’offre se termine dans",
    auth_title: "Compte",
    login: "Connexion",
    signup: "Créer un compte",
    logout: "Déconnexion",
    profile_title: "Profil",
    profile_empty: "Connectez-vous pour voir votre profil et vos commandes.",
    products_title: "Services",
    products_subtitle: "Prix fixes en USD avec conversion automatique.",
    promo_title: "Code promo",
    apply: "Appliquer",
    track_title: "Suivi de commande",
    track: "Suivre",
    contact_title: "Contact",
    faq_title: "FAQ",
    testimonials_title: "Témoignages",
    policy_title: "Légal",
    checkout_title: "Paiement",
    payment_method: "Méthode de paiement",
    confirm_order: "Confirmer la commande",
    invalid_promo: "Code promo invalide.",
    promo_applied: "Promo appliquée",
    order_saved: "Commande enregistrée.",
    order_not_found: "Commande introuvable.",
    invalid_2fa: "Code 2FA invalide."
  }
};

const products = [
  { id: "basic", name: "Basic Package", price: 25, desc: "Starter digital service" },
  { id: "pro", name: "Pro Package", price: 75, desc: "Best-selling premium package" },
  { id: "elite", name: "Elite Package", price: 150, desc: "Luxury full-service option" }
];

const promos = { GOLD10: 10, VIP20: 20, ELITE30: 30 };
const rates = { USDT: 1, SOL: 0.0055, EUR: 0.92 };

function t(key) { return dict[state.lang][key] || key; }

function applyLang() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.body.setAttribute("dir", state.lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t(key)) el.textContent = t(key);
  });
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
}

function updateYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    const usdt = p.price.toFixed(2);
    const sol = (p.price * rates.SOL).toFixed(4);
    const eur = (p.price * rates.EUR).toFixed(2);

    return `
      <div class="glass card">
        <h3>${p.name}</h3>
        <p class="muted">${p.desc}</p>
        <p><strong>$${usdt}</strong> | ${sol} SOL | €${eur}</p>
        <button class="btn btn-primary full buyBtn" data-id="${p.id}">Order now</button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".buyBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedProduct = products.find(p => p.id === btn.dataset.id);
      openCheckout();
    });
  });
}

function openCheckout() {
  if (!state.selectedProduct) return;
  document.getElementById("orderModal")?.classList.remove("hidden");
  document.getElementById("checkoutInfo").innerHTML = `
    <p><strong>${state.selectedProduct.name}</strong></p>
    <p>${state.selectedProduct.desc}</p>
    <p>Base price: $${state.selectedProduct.price.toFixed(2)}</p>
    <p>Discount: ${state.promoDiscount}%</p>
  `;
}

function closeCheckout() {
  document.getElementById("orderModal")?.classList.add("hidden");
}

function updateCountdown() {
  const timer = document.getElementById("countdownTimer");
  if (!timer) return;
  const target = new Date();
  target.setHours(target.getHours() + 6);

  setInterval(() => {
    const diff = target - new Date();
    const h = String(Math.max(0, Math.floor(diff / 3600000))).padStart(2, "0");
    const m = String(Math.max(0, Math.floor((diff % 3600000) / 60000))).padStart(2, "0");
    const s = String(Math.max(0, Math.floor((diff % 60000) / 1000))).padStart(2, "0");
    timer.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

async function signup() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  if (!email || !password) return;

  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await db.collection("users").doc(cred.user.uid).set({
    email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function login() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  if (!email || !password) return;
  await auth.signInWithEmailAndPassword(email, password);
}

async function logout() {
  await auth.signOut();
}

function calcFinalAmount(currency) {
  const base = state.selectedProduct?.price || 0;
  const discounted = base * (1 - state.promoDiscount / 100);
  if (currency === "SOL") return +(discounted * rates.SOL).toFixed(6);
  if (currency === "EUR") return +(discounted * rates.EUR).toFixed(2);
  return +discounted.toFixed(2);
}

async function saveOrder() {
  if (!auth.currentUser) return alert("Login first.");
  if (!state.selectedProduct) return;

  const currency = document.getElementById("paymentSelect")?.value || "USDT";
  const amount = calcFinalAmount(currency);

  const order = {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email,
    product: state.selectedProduct.name,
    productId: state.selectedProduct.id,
    basePriceUSD: state.selectedProduct.price,
    finalAmount: amount,
    currency,
    status: "Pending",
    promoDiscount: state.promoDiscount,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("orders").add(order);
  alert(t("order_saved"));
  closeCheckout();
}

async function loadProfile(user) {
  const box = document.getElementById("profileBox");
  if (!box) return;

  if (!user) {
    box.textContent = t("profile_empty");
    return;
  }

  const snap = await db.collection("orders").where("userId", "==", user.uid).get();
  box.innerHTML = `
    <p><strong>${user.email}</strong></p>
    <p>Orders: ${snap.size}</p>
  `;
}

async function trackOrder() {
  const id = document.getElementById("trackInput")?.value.trim();
  const out = document.getElementById("trackResult");
  if (!id || !out) return;

  const doc = await db.collection("orders").doc(id).get();
  if (!doc.exists) {
    out.textContent = t("order_not_found");
    return;
  }

  const d = doc.data();
  out.innerHTML = `
    <p><strong>${d.product || "Order"}</strong></p>
    <p>Status: ${d.status || "Pending"}</p>
    <p>Amount: ${d.finalAmount} ${d.currency}</p>
  `;
}

function applyPromo() {
  const code = document.getElementById("promoInput")?.value.trim().toUpperCase();
  const result = document.getElementById("promoResult");
  if (!result) return;

  if (!promos[code]) {
    state.promoDiscount = 0;
    result.textContent = t("invalid_promo");
    return;
  }

  state.promoDiscount = promos[code];
  result.textContent = `${t("promo_applied")}: ${state.promoDiscount}%`;
}

async function adminLogin() {
  const email = document.getElementById("adminEmail")?.value.trim();
  const password = document.getElementById("adminPassword")?.value.trim();
  const code = document.getElementById("admin2fa")?.value.trim();

  if (!email || !password) return;
  if (code !== "246810") return alert(t("invalid_2fa"));

  await auth.signInWithEmailAndPassword(email, password);
  state.adminMode = true;
  document.getElementById("adminGate")?.classList.add("hidden");
  document.getElementById("adminPanel")?.classList.remove("hidden");
  await loadAdminData();
}

async function loadAdminData() {
  const ordersSnap = await db.collection("orders").orderBy("createdAt", "desc").get();
  const usersSnap = await db.collection("users").get();

  let profit = 0;
  const orders = [];

  ordersSnap.forEach(doc => {
    const d = doc.data();
    profit += Number(d.finalAmount || 0);
    orders.push({ id: doc.id, ...d });
  });

  document.getElementById("profitMetric").textContent = "$" + profit.toFixed(2);
  document.getElementById("ordersMetric").textContent = orders.length;
  document.getElementById("clientsMetric").textContent = usersSnap.size;

  document.getElementById("ordersList").innerHTML = orders.map(o => `
    <div class="glass-mini" style="margin:10px 0">
      <strong>${o.product || "Order"}</strong> — ${o.email || "No email"}<br>
      Status: ${o.status || "Pending"} | Amount: ${o.finalAmount} ${o.currency}
      <div class="row" style="margin-top:10px; flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="updateOrderStatus('${o.id}','Pending')">Pending</button>
        <button class="btn btn-secondary" onclick="updateOrderStatus('${o.id}','In Progress')">In Progress</button>
        <button class="btn btn-secondary" onclick="updateOrderStatus('${o.id}','Completed')">Completed</button>
        <button class="btn btn-ghost" onclick="deleteOrder('${o.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

async function updateOrderStatus(id, status) {
  await db.collection("orders").doc(id).update({ status });
  await loadAdminData();
}

async function deleteOrder(id) {
  await db.collection("orders").doc(id).delete();
  await loadAdminData();
}

window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;

function initEvents() {
  document.getElementById("langSelect")?.addEventListener("change", e => {
    state.lang = e.target.value;
    localStorage.setItem("lang", state.lang);
    applyLang();
  });

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", state.theme);
    applyTheme();
  });

  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("signupBtn")?.addEventListener("click", signup);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("trackBtn")?.addEventListener("click", trackOrder);
  document.getElementById("applyPromoBtn")?.addEventListener("click", applyPromo);
  document.getElementById("closeModal")?.addEventListener("click", closeCheckout);
  document.getElementById("confirmOrderBtn")?.addEventListener("click", saveOrder);
  document.getElementById("adminLoginBtn")?.addEventListener("click", adminLogin);
  document.getElementById("saveOrderBtn")?.addEventListener("click", saveOrder);

  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(document.getElementById(btn.dataset.copy).textContent.trim());
    });
  });

  document.getElementById("clientSearch")?.addEventListener("input", async e => {
    const q = e.target.value.toLowerCase();
    const snap = await db.collection("users").get();
    const matched = [];

    snap.forEach(doc => {
      const d = doc.data();
      if ((d.email || "").toLowerCase().includes(q)) matched.push(d.email);
    });

    document.getElementById("clientsList").innerHTML = matched.length
      ? matched.map(x => `<div class="glass-mini" style="margin:8px 0">${x}</div>`).join("")
      : `<div class="muted">No results</div>`;
  });
}

auth.onAuthStateChanged(async user => {
  const status = document.getElementById("authStatus");
  if (status) status.textContent = user ? `Logged in: ${user.email}` : "Not logged in";
  await loadProfile(user);
  if (state.adminMode && user) await loadAdminData();
});

applyLang();
applyTheme();
renderProducts();
updateCountdown();
initEvents();
updateYear();

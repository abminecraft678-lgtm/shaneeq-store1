// js/app.js
// Shared logic used across every storefront page: cart, wishlist, header
// interactions, toast notifications, scroll-reveal animation and API helpers.
// Depends on js/config.js being loaded first (defines API_BASE_URL).

/* ============================= API HELPERS ============================= */

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function money(n) {
  return `Rs. ${Number(n).toLocaleString('en-PK')}`;
}

/* ============================== TOAST UI ================================ */

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ============================ CART (localStorage) ======================= */

const CART_KEY = 'shaneeq_cart';
const WISHLIST_KEY = 'shaneeq_wishlist';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, options = {}) {
  const cart = getCart();
  const size = options.size || product.sizes?.[0] || 'Standard';
  const color = options.color || product.colors?.[0] || '';
  const qty = options.quantity || 1;

  const existing = cart.find(
    (i) => i.productId === product._id && i.size === size && i.color === color
  );

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.discountPrice || product.price,
      size,
      color,
      quantity: qty,
    });
  }

  saveCart(cart);
  showToast(`${product.name} added to your bag`);
  renderCartDrawer();
}

function updateCartQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartDrawer();
}

function cartSubtotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = getCart().reduce((s, i) => s + i.quantity, 0);
}

/* ============================ WISHLIST (localStorage) ==================== */

function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateWishlistBadge();
}

function toggleWishlist(product, btnEl) {
  let list = getWishlist();
  const exists = list.find((i) => i.productId === product._id);

  if (exists) {
    list = list.filter((i) => i.productId !== product._id);
    showToast('Removed from wishlist');
    if (btnEl) btnEl.classList.remove('active');
  } else {
    list.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.discountPrice || product.price,
    });
    showToast('Added to wishlist');
    if (btnEl) btnEl.classList.add('active');
  }
  saveWishlist(list);
  renderWishlistDrawer();
}

function isWishlisted(productId) {
  return getWishlist().some((i) => i.productId === productId);
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-count');
  if (badge) badge.textContent = getWishlist().length;
}

/* ============================ DRAWER RENDERING ============================ */

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  if (!body) return;

  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bag-shopping"></i><p>Your shopping bag is empty.</p></div>`;
    if (footer) footer.innerHTML = '';
    return;
  }

  body.innerHTML = cart
    .map(
      (item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <div class="cart-item-meta">${item.size ? 'Size: ' + item.size : ''} ${item.color ? '| ' + item.color : ''}</div>
        <div class="qty-control">
          <button onclick="updateCartQty(${idx}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQty(${idx}, 1)">+</button>
          <span style="margin-left:auto; font-weight:600;">${money(item.price * item.quantity)}</span>
        </div>
        <button class="remove-item" onclick="removeFromCart(${idx})">Remove</button>
      </div>
    </div>`
    )
    .join('');

  if (footer) {
    footer.innerHTML = `
      <div class="cart-total-row"><span>Subtotal</span><span>${money(cartSubtotal())}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
    `;
  }
}

function renderWishlistDrawer() {
  const body = document.getElementById('wishlist-drawer-body');
  if (!body) return;

  const list = getWishlist();

  if (list.length === 0) {
    body.innerHTML = `<div class="empty-state"><i class="fa-regular fa-heart"></i><p>Your wishlist is empty.</p></div>`;
    return;
  }

  body.innerHTML = list
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <div class="cart-item-meta">${money(item.price)}</div>
        <a href="product.html?id=${item.productId}" class="btn btn-outline" style="padding:8px 16px; font-size:0.72rem; margin-top:8px;">View Product</a>
      </div>
    </div>`
    )
    .join('');
}

/* =============================== DRAWERS / NAV ============================ */

function openDrawer(id) {
  document.getElementById(id)?.classList.add('active');
  document.getElementById('drawer-overlay')?.classList.add('active');
}
function closeDrawers() {
  document.querySelectorAll('.drawer').forEach((d) => d.classList.remove('active'));
  document.getElementById('drawer-overlay')?.classList.remove('active');
}

function initHeaderInteractions() {
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    renderCartDrawer();
    openDrawer('cart-drawer');
  });
  document.getElementById('wishlist-btn')?.addEventListener('click', () => {
    renderWishlistDrawer();
    openDrawer('wishlist-drawer');
  });
  document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawers);
  document.querySelectorAll('.drawer-close').forEach((btn) =>
    btn.addEventListener('click', closeDrawers)
  );


  // Search toggle
const searchToggle = document.getElementById('search-toggle');
const searchBox = document.getElementById('search-box');
searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBox?.classList.toggle('active');
    searchBox?.querySelector('input')?.focus();
});
  document.addEventListener('click', (e) => {
    if (searchBox && !searchBox.contains(e.target) && e.target !== searchToggle) {
      searchBox.classList.remove('active');
    }
  });
  document.getElementById('search-box')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = searchBox?.querySelector('input');
    const q = input ? input.value.trim() : '';
    if (q) window.location.href = `shop.html?keyword=${encodeURIComponent(q)}`;
});

  // Mobile nav
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  mobileToggle?.addEventListener('click', () => mobileNav.classList.add('active'));
  document.getElementById('mobile-nav-close')?.addEventListener('click', () =>
    mobileNav.classList.remove('active')
  );

  updateCartBadge();
  updateWishlistBadge();
}

/* =============================== SCROLL REVEAL ============================ */

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* =============================== INIT ============================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderInteractions();
  initScrollReveal();
});
window.quickSearch = function(value) {
    if (value === 'Men' || value === 'Women') {
        window.location.href = `shop.html?category=${value}`;
    } else {
        window.location.href = `shop.html?keyword=${encodeURIComponent(value)}`;
    }
};
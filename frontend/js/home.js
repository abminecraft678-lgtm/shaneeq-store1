// js/home.js
// Loads featured products for the homepage grid.

function productCardHTML(p) {
  const wished = isWishlisted(p._id) ? 'active' : '';
  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
  return `
  <div class="product-card reveal">
    <div class="product-thumb">
      <a href="product.html?id=${p._id}">
        <img src="${p.images?.[0] || 'https://via.placeholder.com/400x520?text=Shaneeq'}" alt="${p.name}">
      </a>
      ${p.isNewArrival ? '<span class="product-tag">New</span>' : ''}
      <button class="wishlist-btn ${wished}" onclick='toggleWishlist(${JSON.stringify(p).replace(/'/g, "&apos;")}, this)'>
        <i class="fa-solid fa-heart"></i>
      </button>
      <div class="quick-add" onclick='addToCart(${JSON.stringify(p).replace(/'/g, "&apos;")})'>+ Quick Add</div>
    </div>
    <div class="product-info">
      <div class="p-category">${p.category} · ${p.type}</div>
      <a href="product.html?id=${p._id}"><h4>${p.name}</h4></a>
      <div class="price-row">
        <span class="price-now">${money(hasDiscount ? p.discountPrice : p.price)}</span>
        ${hasDiscount ? `<span class="price-old">${money(p.price)}</span>` : ''}
      </div>
      ${p.ratingCount ? `<div class="rating-row">${'★'.repeat(Math.round(p.ratingAverage))}${'☆'.repeat(5 - Math.round(p.ratingAverage))} (${p.ratingCount})</div>` : ''}
    </div>
  </div>`;
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const data = await apiGet('/products?featured=true&limit=8');
    grid.innerHTML = data.products.length
      ? data.products.map(productCardHTML).join('')
      : '<p style="text-align:center; grid-column:1/-1; color:var(--color-muted);">No featured products yet. Please check back soon.</p>';
    initScrollReveal();
  } catch (err) {
    grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:var(--color-muted);">Unable to load products right now (${err.message}). Please make sure the backend server is running.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);

// js/product.js
// Product detail page: loads a single product by ?id=, handles add-to-cart
// with size/color/quantity selection, and loads/submits reviews.

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedQty = 1;

function getProductId() {
  return new URLSearchParams(window.location.search).get('id');
}

async function loadProduct() {
  const id = getProductId();
  const wrap = document.getElementById('product-detail');
  if (!id) {
    wrap.innerHTML = '<p>No product specified.</p>';
    return;
  }

  try {
    currentProduct = await apiGet(`/products/${id}`);
    renderProduct(currentProduct);
    loadReviews(id);
  } catch (err) {
   wrap.innerHTML = `<div style="text-align: center; padding: 60px 20px;"><h3 style="font-size: 24px; color: #333; margin-bottom: 10px;">Product Not Available</h3><p style="color: #666; font-size: 16px;">This product is currently offline or does not exist.</p></div>`;
  }
}

function renderProduct(p) {
  document.title = `${p.name} | Shaneeq`;
  selectedSize = p.sizes?.[0] || null;
  selectedColor = p.colors?.[0] || null;

  const hasDiscount = p.discountPrice && p.discountPrice < p.price;

  document.getElementById('product-detail').innerHTML = `
    <div class="pd-gallery reveal">
      <div class="pd-main-image">
        <img id="pd-main-img" src="${p.images?.[0] || 'https://via.placeholder.com/600x760?text=Shaneeq'}" alt="${p.name}">
      </div>
      <div class="pd-thumbs">
        ${(p.images || []).map((img, i) => `<img src="${img}" onclick="document.getElementById('pd-main-img').src='${img}'" class="${i === 0 ? 'active' : ''}">`).join('')}
      </div>
    </div>
    <div class="pd-info reveal reveal-delay-1">
      <div class="p-category">${p.category} · ${p.type}${p.fabric ? ' · ' + p.fabric : ''}</div>
      <h1>${p.name}</h1>
      <div class="rating-row" style="margin-bottom:14px;">
        ${p.ratingCount ? `${'★'.repeat(Math.round(p.ratingAverage))}${'☆'.repeat(5 - Math.round(p.ratingAverage))} <span style="color:var(--color-muted)">(${p.ratingCount} reviews)</span>` : '<span style="color:var(--color-muted)">No reviews yet</span>'}
      </div>
      <div class="price-row" style="font-size:1.3rem; margin-bottom:20px;">
        <span class="price-now">${money(hasDiscount ? p.discountPrice : p.price)}</span>
        ${hasDiscount ? `<span class="price-old">${money(p.price)}</span>` : ''}
      </div>
      <p style="color:var(--color-ink-soft); margin-bottom:26px;">${p.description}</p>

      ${p.sizes?.length ? `
      <div class="option-group">
        <label>Size</label>
        <div class="option-pills" id="size-pills">
          ${p.sizes.map((s, i) => `<button class="option-pill ${i === 0 ? 'active' : ''}" onclick="selectSize('${s}', this)">${s}</button>`).join('')}
        </div>
      </div>` : ''}

      ${p.colors?.length ? `
      <div class="option-group">
        <label>Color</label>
        <div class="option-pills" id="color-pills">
          ${p.colors.map((c, i) => `<button class="option-pill ${i === 0 ? 'active' : ''}" onclick="selectColor('${c}', this)">${c}</button>`).join('')}
        </div>
      </div>` : ''}

      <div class="option-group">
        <label>Quantity</label>
        <div class="qty-control" style="width:fit-content;">
          <button onclick="changeQty(-1)">−</button>
          <span id="qty-display">1</span>
          <button onclick="changeQty(1)">+</button>
        </div>
      </div>

      <div style="display:flex; gap:14px; margin-top:26px; flex-wrap:wrap;">
        <button class="btn btn-primary" style="flex:1;" onclick="addSelectedToCart()"><i class="fa-solid fa-bag-shopping"></i> Add to Bag</button>
        <button class="btn btn-outline" id="pd-wishlist-btn" onclick="toggleWishlist(currentProduct, document.getElementById('pd-wishlist-btn'))">
          <i class="fa-solid fa-heart"></i> Wishlist
        </button>
      </div>

      <p style="margin-top:20px; font-size:0.85rem; color:var(--color-muted);">
        <i class="fa-solid fa-truck"></i> Cash on Delivery available nationwide &nbsp;|&nbsp;
        <i class="fa-solid fa-phone"></i> Order support: <a href="tel:03134356819" style="color:var(--color-gold-dark);">0313-4356819</a>
      </p>
    </div>
  `;

  if (isWishlisted(p._id)) document.getElementById('pd-wishlist-btn')?.classList.add('active');
  initScrollReveal();
}

function selectSize(size, el) {
  selectedSize = size;
  document.querySelectorAll('#size-pills .option-pill').forEach((b) => b.classList.remove('active'));
  el.classList.add('active');
}
function selectColor(color, el) {
  selectedColor = color;
  document.querySelectorAll('#color-pills .option-pill').forEach((b) => b.classList.remove('active'));
  el.classList.add('active');
}
function changeQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  document.getElementById('qty-display').textContent = selectedQty;
}
function addSelectedToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct, { size: selectedSize, color: selectedColor, quantity: selectedQty });
}

/* ============================ REVIEWS ============================ */

let chosenRating = 0;

function initStarSelect() {
  const stars = document.querySelectorAll('#review-stars i');
  stars.forEach((star) => {
    star.addEventListener('click', () => {
      chosenRating = Number(star.dataset.value);
      stars.forEach((s) => s.classList.toggle('active', Number(s.dataset.value) <= chosenRating));
    });
  });
}

async function loadReviews(productId) {
  const list = document.getElementById('reviews-list');
  try {
    const reviews = await apiGet(`/reviews/product/${productId}`);
    list.innerHTML = reviews.length
      ? reviews.map((r) => `
        <div class="review-item">
          <div class="review-head">
            <strong>${r.name}</strong>
            <span class="rating-row">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          <p>${r.comment}</p>
          <span class="review-date">${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>`).join('')
      : '<p style="color:var(--color-muted);">No reviews yet. Be the first to review this product!</p>';
  } catch (err) {
    list.innerHTML = '<p style="color:var(--color-muted);">Could not load reviews.</p>';
  }
}

function initReviewForm() {
  initStarSelect();
  const form = document.getElementById('review-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chosenRating) return showToast('Please select a star rating');

    const name = document.getElementById('review-name').value.trim();
    const comment = document.getElementById('review-comment').value.trim();

    try {
      await apiPost('/reviews', { product: getProductId(), name, rating: chosenRating, comment });
      showToast('Thank you! Your review has been posted.');
      form.reset();
      document.querySelectorAll('#review-stars i').forEach((s) => s.classList.remove('active'));
      chosenRating = 0;
      loadReviews(getProductId());
    } catch (err) {
      showToast(err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  initReviewForm();
});

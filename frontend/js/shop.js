// js/shop.js
// Product listing page: reads filters from the URL, fetches matching
// products from the API, and re-renders when filters change.

const state = {
  keyword: '',
  category: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  page: 1,
  limit: 12,
};

function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  state.keyword = params.get('keyword') || '';
  state.category = params.get('category') || '';
  state.type = params.get('type') || '';
}

function buildQuery() {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

function updateActiveChips() {
  document.querySelectorAll('.filter-chip[data-category]').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.category === state.category);
  });
  document.querySelectorAll('.filter-chip[data-type]').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.type === state.type);
  });
}

async function loadProducts() {
  const grid = document.getElementById('shop-grid');
  const heading = document.getElementById('shop-heading');
  const resultCount = document.getElementById('result-count');

  grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--color-muted);">Loading products…</p>';
  heading.textContent = state.category ? `${state.category}'s Collection` : (state.keyword ? `Results for "${state.keyword}"` : 'All Products');

  try {
    const data = await apiGet(`/products?${buildQuery()}`);
    resultCount.textContent = `${data.total} product${data.total === 1 ? '' : 's'} found`;

    grid.innerHTML = data.products.length
      ? data.products.map(productCardHTML).join('')
      : '<p style="text-align:center; grid-column:1/-1; color:var(--color-muted);">No products match your filters. Try adjusting your search.</p>';

    renderPagination(data.pages, data.page);
    initScrollReveal();
  } catch (err) {
    grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:var(--color-muted);">Unable to load products (${err.message}). Make sure the backend server is running and CORS is configured for this origin.</p>`;
  }
}

function renderPagination(pages, current) {
  const wrap = document.getElementById('pagination');
  if (!wrap || pages <= 1) {
    if (wrap) wrap.innerHTML = '';
    return;
  }
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="filter-chip ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  wrap.innerHTML = html;
}

function goToPage(p) {
  state.page = p;
  loadProducts();
  window.scrollTo({ top: document.getElementById('shop-heading').offsetTop - 120, behavior: 'smooth' });
}

function initFilterControls() {
  document.querySelectorAll('.filter-chip[data-category]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.category = state.category === chip.dataset.category ? '' : chip.dataset.category;
      state.page = 1;
      updateActiveChips();
      loadProducts();
    });
  });
  document.querySelectorAll('.filter-chip[data-type]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.type = state.type === chip.dataset.type ? '' : chip.dataset.type;
      state.page = 1;
      updateActiveChips();
      loadProducts();
    });
  });

  const priceForm = document.getElementById('price-filter-form');
  priceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.minPrice = document.getElementById('min-price').value;
    state.maxPrice = document.getElementById('max-price').value;
    state.page = 1;
    loadProducts();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  readStateFromURL();
  updateActiveChips();
  initFilterControls();
  loadProducts();
});

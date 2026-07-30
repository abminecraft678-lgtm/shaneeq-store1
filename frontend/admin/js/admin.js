// admin/js/admin.js
// Powers the admin dashboard: navigation between sections, dashboard stats,
// product CRUD, order status updates, and review moderation.
// All requests go through adminApiFetch() (see admin-auth.js) which attaches
// the JWT and redirects to login on session expiry.

requireAdminAuth(); // guard this page immediately

function money(n) {
  return `Rs. ${Number(n).toLocaleString('en-PK')}`;
}

/* ============================ NAVIGATION ============================ */

function showSection(name) {
  document.querySelectorAll('.a-section').forEach((s) => s.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');
  document.querySelectorAll('.a-nav-item').forEach((n) => n.classList.toggle('active', n.dataset.section === name));
  document.getElementById('section-title').textContent = name.charAt(0).toUpperCase() + name.slice(1);

  if (name === 'dashboard') loadDashboardStats();
  if (name === 'products') loadProducts();
  if (name === 'orders') loadOrders();
  if (name === 'reviews') loadReviews();
}

document.querySelectorAll('.a-nav-item').forEach((item) => {
  item.addEventListener('click', () => showSection(item.dataset.section));
});

/* ============================ DASHBOARD STATS ============================ */

async function loadDashboardStats() {
  try {
    const stats = await adminApiFetch('/admin/dashboard');
    document.getElementById('stat-products').textContent = stats.totalProducts;
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-pending').textContent = stats.pendingOrders;
    document.getElementById('stat-revenue').textContent = money(stats.totalRevenue);
  } catch (err) {
    console.error(err.message);
  }
}

/* ============================ PRODUCTS ============================ */

let allProducts = [];

async function loadProducts() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = `<tr><td colspan="8" class="a-empty">Loading products…</td></tr>`;
  try {
    const data = await fetch(`${API_BASE_URL}/products?limit=200`).then((r) => r.json());
    allProducts = data.products;
    tbody.innerHTML = allProducts.length
      ? allProducts.map(productRow).join('')
      : `<tr><td colspan="8" class="a-empty">No products yet. Click "Add Product" to get started.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="a-empty">Failed to load products: ${err.message}</td></tr>`;
  }
}

function productRow(p) {
  return `
    <tr>
      <td><img src="${p.images?.[0] || 'https://via.placeholder.com/60x76'}" alt=""></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.type}</td>
      <td>${money(p.discountPrice || p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.featured ? '<i class="fa-solid fa-check" style="color:var(--a-success);"></i>' : '—'}</td>
      <td>
        <button class="a-icon-btn edit" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'><i class="fa-solid fa-pen"></i></button>
        <button class="a-icon-btn delete" onclick="deleteProduct('${p._id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
}

function openProductModal(product = null) {
  document.getElementById('product-modal-title').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('product-id').value = product?._id || '';
  document.getElementById('p-name').value = product?.name || '';
  document.getElementById('p-description').value = product?.description || '';
  document.getElementById('p-category').value = product?.category || 'Men';
  document.getElementById('p-type').value = product?.type || 'Stitched';
  document.getElementById('p-price').value = product?.price || '';
  document.getElementById('p-discount-price').value = product?.discountPrice || '';
  document.getElementById('p-fabric').value = product?.fabric || '';
  document.getElementById('p-stock').value = product?.stock ?? '';
  document.getElementById('p-sizes').value = (product?.sizes || []).join(', ');
  document.getElementById('p-colors').value = (product?.colors || []).join(', ');
  document.getElementById('p-images').value = (product?.images || []).join(', ');
  document.getElementById('p-featured').checked = !!product?.featured;
  document.getElementById('p-new').checked = !!product?.isNewArrival;
  document.getElementById('product-modal-overlay').classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').classList.remove('active');
}

function splitCommaList(value) {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;

  const payload = {
    name: document.getElementById('p-name').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    category: document.getElementById('p-category').value,
    type: document.getElementById('p-type').value,
    price: Number(document.getElementById('p-price').value),
    discountPrice: document.getElementById('p-discount-price').value
      ? Number(document.getElementById('p-discount-price').value)
      : null,
    fabric: document.getElementById('p-fabric').value.trim(),
    stock: Number(document.getElementById('p-stock').value),
    sizes: splitCommaList(document.getElementById('p-sizes').value),
    colors: splitCommaList(document.getElementById('p-colors').value),
    images: splitCommaList(document.getElementById('p-images').value),
    featured: document.getElementById('p-featured').checked,
    isNewArrival: document.getElementById('p-new').checked,
  };

  try {
    if (id) {
      await adminApiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await adminApiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
});

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await adminApiFetch(`/products/${id}`, { method: 'DELETE' });
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

/* ============================ ORDERS ============================ */

async function loadOrders() {
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = `<tr><td colspan="7" class="a-empty">Loading orders…</td></tr>`;
  try {
    const orders = await adminApiFetch('/orders');
    tbody.innerHTML = orders.length
      ? orders.map(orderRow).join('')
      : `<tr><td colspan="7" class="a-empty">No orders yet.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="a-empty">Failed to load orders: ${err.message}</td></tr>`;
  }
}

function orderRow(o) {
  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  return `
    <tr>
      <td><strong>${o.orderId}</strong></td>
      <td>${o.customer.fullName}<br><span style="color:var(--a-muted); font-size:0.78rem;">${o.customer.address}, ${o.customer.city}</span></td>
      <td>${o.customer.phone}</td>
      <td>${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
      <td>${money(o.grandTotal)}</td>
      <td>
        <select class="a-status-select" onchange="updateOrderStatus('${o._id}', this.value)">
          ${statuses.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${new Date(o.createdAt).toLocaleDateString()}</td>
    </tr>`;
}

async function updateOrderStatus(id, status) {
  try {
    await adminApiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  } catch (err) {
    alert(err.message);
  }
}

/* ============================ REVIEWS ============================ */

async function loadReviews() {
  const tbody = document.getElementById('reviews-table-body');
  tbody.innerHTML = `<tr><td colspan="6" class="a-empty">Loading reviews…</td></tr>`;
  try {
    const reviews = await adminApiFetch('/reviews');
    tbody.innerHTML = reviews.length
      ? reviews.map(reviewRow).join('')
      : `<tr><td colspan="6" class="a-empty">No reviews yet.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="a-empty">Failed to load reviews: ${err.message}</td></tr>`;
  }
}

function reviewRow(r) {
  return `
    <tr>
      <td>${r.product?.name || 'Deleted product'}</td>
      <td>${r.name}</td>
      <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
      <td style="max-width:260px;">${r.comment}</td>
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      <td><button class="a-icon-btn delete" onclick="deleteReview('${r._id}')"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`;
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  try {
    await adminApiFetch(`/reviews/${id}`, { method: 'DELETE' });
    loadReviews();
  } catch (err) {
    alert(err.message);
  }
}

/* ============================ INIT ============================ */

document.addEventListener('DOMContentLoaded', () => {
  const info = getAdminInfo();
  if (info) document.getElementById('admin-name-display').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${info.name}`;
  loadDashboardStats();
});

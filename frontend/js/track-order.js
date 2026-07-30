// js/track-order.js
// Looks up an order by its human-friendly orderId and renders a status timeline.

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

async function trackOrder(e) {
  e.preventDefault();
  const input = document.getElementById('order-id-input');
  const resultWrap = document.getElementById('track-result');
  const orderId = input.value.trim().toUpperCase();

  if (!orderId) return showToast('Please enter your order ID');

  resultWrap.innerHTML = '<p style="text-align:center; color:var(--color-muted);">Searching…</p>';

  try {
    const order = await apiGet(`/orders/track/${orderId}`);
    renderOrder(order);
  } catch (err) {
    resultWrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>${err.message}</p></div>`;
  }
}

function renderOrder(order) {
  const resultWrap = document.getElementById('track-result');

  if (order.status === 'Cancelled') {
    resultWrap.innerHTML = `
      <div class="order-result">
        <h3>Order ${order.orderId}</h3>
        <p style="color:var(--color-danger); font-weight:600; margin:10px 0;">This order has been cancelled.</p>
        ${orderItemsHTML(order)}
      </div>`;
    return;
  }

  const currentIndex = STATUS_STEPS.indexOf(order.status);

  resultWrap.innerHTML = `
    <div class="order-result">
      <h3>Order ${order.orderId}</h3>
      <p style="color:var(--color-muted); margin-bottom:24px;">Placed on ${new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div class="status-timeline">
        ${STATUS_STEPS.map((step, i) => `
          <div class="status-step ${i <= currentIndex ? 'done' : ''}">
            <div class="status-dot"><i class="fa-solid fa-check"></i></div>
            <span>${step}</span>
          </div>
        `).join('')}
      </div>

      ${orderItemsHTML(order)}

      <div class="cart-total-row" style="font-size:1.1rem; border-top:1px solid var(--color-line); padding-top:14px; margin-top:14px;">
        <span>Total (Cash on Delivery)</span><span>${money(order.grandTotal)}</span>
      </div>
    </div>
  `;
}

function orderItemsHTML(order) {
  return `
    <div style="margin:20px 0;">
      ${order.items.map((item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h5>${item.name}</h5>
            <div class="cart-item-meta">${item.size ? 'Size: ' + item.size : ''} ${item.color ? '| ' + item.color : ''} × ${item.quantity}</div>
            <div style="font-weight:600;">${money(item.price * item.quantity)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('track-order-form')?.addEventListener('submit', trackOrder);
});

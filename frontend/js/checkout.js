// js/checkout.js
// Renders the order summary from the cart and submits a Cash on Delivery order.

const SHIPPING_FEE = 250;

function renderOrderSummary() {
  const cart = getCart();
  const wrap = document.getElementById('order-summary-items');
  const totalsWrap = document.getElementById('order-totals');
  const placeBtn = document.getElementById('place-order-btn');

  if (cart.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bag-shopping"></i><p>Your bag is empty. <a href="shop.html" style="color:var(--color-gold-dark);">Continue shopping</a></p></div>`;
    totalsWrap.innerHTML = '';
    if (placeBtn) placeBtn.disabled = true;
    return;
  }

  wrap.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <div class="cart-item-meta">${item.size ? 'Size: ' + item.size : ''} ${item.color ? '| ' + item.color : ''} × ${item.quantity}</div>
        <div style="font-weight:600;">${money(item.price * item.quantity)}</div>
      </div>
    </div>`
    )
    .join('');

  const subtotal = cartSubtotal();
  const grandTotal = subtotal + SHIPPING_FEE;

  totalsWrap.innerHTML = `
    <div class="cart-total-row" style="font-weight:400;"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="cart-total-row" style="font-weight:400;"><span>Shipping</span><span>${money(SHIPPING_FEE)}</span></div>
    <div class="cart-total-row" style="font-size:1.1rem; border-top:1px solid var(--color-line); padding-top:14px;"><span>Total (COD)</span><span>${money(grandTotal)}</span></div>
  `;
}

async function submitOrder(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) return showToast('Your bag is empty');

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing Order...';

  const payload = {
    customer: {
      fullName: document.getElementById('fullName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
    },
    items: cart.map((i) => ({
      product: i.productId,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    })),
    shippingFee: SHIPPING_FEE,
  };

  try {
    const order = await apiPost('/orders', payload);
    localStorage.removeItem(CART_KEY);
    window.location.href = `order-success.html?orderId=${order.orderId}`;
  } catch (err) {
    showToast(err.message);
    btn.disabled = false;
    btn.textContent = 'Place Order (Cash on Delivery)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  document.getElementById('checkout-form')?.addEventListener('submit', submitOrder);
});

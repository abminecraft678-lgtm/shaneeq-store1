// js/footer.js
// Injects the shared footer markup into any page with <footer id="site-footer">.
// Keeping it in one place avoids duplicating/maintaining the footer HTML on every page.

document.addEventListener('DOMContentLoaded', () => {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">SHANEEQ<span>.</span></div>
          <p>Premium stitched & unstitched clothing for Men, Women and Kids —
          crafted with quality fabrics and timeless design, delivered across Pakistan
          with Cash on Delivery.</p>
          <div class="social-row">
            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://wa.me/923134356819" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><a href="shop.html?category=Men">Men</a></li>
            <li><a href="shop.html?category=Women">Women</a></li>
            <li><a href="shop.html?category=Kids">Kids</a></li>
            <li><a href="shop.html?type=Unstitched">Unstitched</a></li>
            <li><a href="shop.html?type=Stitched">Stitched</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Customer Care</h5>
          <ul>
            <li><a href="track-order.html">Track Your Order</a></li>
            <li><a href="cart.html">Shopping Bag</a></li>
            <li><a href="checkout.html">Checkout</a></li>
            <li><a href="#">Returns & Exchanges</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Contact Us</h5>
          <ul class="footer-contact">
            <li><i class="fa-solid fa-phone"></i> <a href="tel:03134356819" class="highlight">0313-4356819</a></li>
            <li><i class="fa-solid fa-envelope"></i> support@shaneeq.com</li>
            <li><i class="fa-solid fa-location-dot"></i> Lahore, Punjab, Pakistan</li>
            <li><i class="fa-solid fa-clock"></i> Mon – Sat, 10am – 8pm</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} Shaneeq. All rights reserved. | Cash on Delivery available nationwide.
      </div>
    </div>
  `;
});

# Shaneeq — Premium Clothing E-commerce Platform

A full-stack e-commerce website for **Shaneeq**, a premium clothing brand for Men,
Women, and Kids (Stitched & Unstitched). Built with Node.js/Express/MongoDB on the
backend and vanilla HTML/CSS/JS on the frontend, with a separate password-protected
Admin Dashboard.

📞 **Brand contact:** 0313-4356819

---

## 1. Project Structure

```
shaneeq/
├── backend/                   # Express + MongoDB API
│   ├── config/
│   │   └── db.js              # Mongoose connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js            # JWT protection for admin routes
│   ├── server.js              # App entry point (CORS, routes, DB)
│   ├── seed.js                # One-time admin + sample product seeder
│   ├── package.json
│   └── .env.example
│
└── frontend/                  # Static storefront + admin portal
    ├── index.html              # Homepage
    ├── shop.html                # Product listing with filters
    ├── product.html             # Product detail + reviews
    ├── cart.html                 # Full shopping bag page
    ├── checkout.html              # Cash on Delivery checkout
    ├── order-success.html          # Order confirmation
    ├── track-order.html             # Order tracking by Order ID
    ├── css/style.css
    ├── js/
    │   ├── config.js            # API_BASE_URL — set this to your backend URL
    │   ├── app.js                # Cart, wishlist, header, drawers, scroll reveal
    │   ├── footer.js
    │   ├── home.js
    │   ├── shop.js
    │   ├── product.js
    │   ├── checkout.js
    │   └── track-order.js
    ├── admin/
    │   ├── login.html            # /admin/login.html — admin sign-in
    │   ├── dashboard.html         # Product / Order / Review management
    │   ├── css/admin.css
    │   └── js/
    │       ├── admin-auth.js
    │       └── admin.js
    └── vercel.json
```

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/shaneeq
PORT=5000
JWT_SECRET=your_long_random_secret
CLIENT_ORIGINS=http://localhost:5500,https://shaneeq.vercel.app
ADMIN_EMAIL=admin@shaneeq.com
ADMIN_PASSWORD=ChangeMe123!
```

Create your first admin account + a few sample products:

```bash
node seed.js
```

Start the server:

```bash
npm run dev      # with nodemon, for local development
# or
npm start        # production
```

The API will run at `http://localhost:5000`, with routes under `/api/...`.

### Key API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | List/search/filter products (`keyword`, `category`, `type`, `minPrice`, `maxPrice`, `featured`, `page`, `limit`) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/orders` | Place a Cash on Delivery order | Public |
| GET | `/api/orders/track/:orderId` | Track order (e.g. `SHQ-48213`) | Public |
| GET | `/api/orders` | List all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/reviews/product/:productId` | Get a product's reviews | Public |
| POST | `/api/reviews` | Submit a review | Public |
| GET | `/api/reviews` | List all reviews (moderation) | Admin |
| DELETE | `/api/reviews/:id` | Delete a review | Admin |
| POST | `/api/admin/login` | Admin login (returns JWT) | Public |
| GET | `/api/admin/dashboard` | Dashboard summary stats | Admin |

---

## 3. Frontend Setup

The frontend is fully static (no build step) — plain HTML/CSS/JS.

1. Open `frontend/js/config.js` and set your deployed backend URL:
   ```js
   const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
   ```
2. Serve the `frontend/` folder locally with any static server, e.g.:
   ```bash
   npx serve frontend
   # or the VS Code "Live Server" extension
   ```
3. Deploy `frontend/` to **Vercel** as a static site (no framework preset needed).

---

## 4. CORS Notes

Since the frontend (Vercel) and backend (Render/Glitch/Railway/etc.) live on
different domains, `CLIENT_ORIGINS` in the backend `.env` **must** include your
exact Vercel domain (and `http://localhost:...` for local testing), e.g.:

```
CLIENT_ORIGINS=https://shaneeq.vercel.app,http://localhost:5500
```

`server.js` reads this and only allows those origins through `cors()`.

---

## 5. Admin Portal

- URL: `https://your-frontend-domain.com/admin/login.html`
- Credentials: whatever you set as `ADMIN_EMAIL` / `ADMIN_PASSWORD` before running `seed.js`
- The dashboard (`admin/dashboard.html`) is guarded client-side (redirects to
  login if no JWT) **and** server-side (every admin API route requires a valid
  JWT via the `protectAdmin` middleware) — so it's not just hidden, it's actually protected.
- From the dashboard you can:
  - Add / edit / delete products (with sizes, colors, images, pricing, stock)
  - View all Cash on Delivery orders and update their status (Pending → Confirmed → Shipped → Delivered, or Cancelled)
  - Moderate (delete) customer reviews

---

## 6. Features Checklist

- ✅ Premium, mobile-responsive storefront UI with scroll-fade-in & hover animations
- ✅ Men / Women / Kids categories with Stitched / Unstitched sub-categories
- ✅ Search + filter by category, type, and price range
- ✅ Persistent Cart & Wishlist (localStorage) with slide-in drawers
- ✅ Product detail pages with size/color/quantity selection
- ✅ Customer reviews (submit + view, star ratings)
- ✅ Cash on Delivery checkout (server recalculates totals for integrity)
- ✅ Order tracking by human-friendly Order ID (e.g. `SHQ-48213`)
- ✅ Separate Admin Dashboard (`/admin/login.html`) with JWT-protected routes
- ✅ CORS configured for a split frontend/backend deployment

---

## 7. Suggested Free Hosting

- **Backend:** Render.com or Railway.app (Node.js web service) + MongoDB Atlas (free tier)
- **Frontend:** Vercel (static site) — just deploy the `frontend/` folder

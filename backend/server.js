// server.js
// Entry point for the Shaneeq backend API (Express + MongoDB/Mongoose).
// Designed to be deployed separately from the frontend (e.g. Render/Glitch/Railway),
// with the frontend hosted on Vercel — hence the explicit CORS whitelist below.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();

// ---------- Database ----------
connectDB();

// ---------- Core Middleware ----------
app.use(express.json({ limit: '5mb' })); // parse JSON bodies
app.use(morgan('dev')); // request logging in the console

// ---------- CORS Configuration ----------
// The frontend (Vercel) and backend (Glitch/Render/etc.) live on different
// domains, so we need to explicitly allow the frontend's origin(s).
// Set CLIENT_ORIGINS in your .env as a comma-separated list, e.g.:
// CLIENT_ORIGINS=https://shaneeq.vercel.app,http://localhost:5500
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.json({ message: '🧵 Shaneeq API is running smoothly.' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Shaneeq server running on port ${PORT}`);
});

module.exports = app;

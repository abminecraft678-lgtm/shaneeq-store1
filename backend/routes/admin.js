// routes/admin.js
// Handles admin login (JWT issue) and dashboard summary stats.
// NOTE: Admin accounts are created via the one-time backend/seed.js script,
// there is intentionally no public registration route for security.

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { protectAdmin } = require('../middleware/auth');

const generateToken = (admin) =>
  jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// @route   POST /api/admin/login
// @desc    Admin login - returns a JWT used for all protected admin requests
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase() });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Summary stats for the admin dashboard home screen
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    const [totalProducts, totalOrders, pendingOrders, totalReviews, revenueAgg] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'Pending' }),
        Review.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ]),
      ]);

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalReviews,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching dashboard stats', error: err.message });
  }
});

module.exports = router;

// routes/reviews.js
// Public: add a review, view a product's reviews.
// Admin (protected): delete/moderate reviews.

const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/auth');

// Helper to recalculate a product's average rating after a review change
async function refreshProductRating(productId) {
  const reviews = await Review.find({ product: productId, approved: true });
  const ratingCount = reviews.length;
  const ratingAverage = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(ratingAverage * 10) / 10,
    ratingCount,
  });
}

// @route   GET /api/reviews/product/:productId
// @desc    Get all approved reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      approved: true,
    }).sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching reviews', error: err.message });
  }
});

// @route   POST /api/reviews
// @desc    Add a new review for a product
router.post('/', async (req, res) => {
  try {
    const { product, name, rating, comment } = req.body;

    if (!product || !name || !rating || !comment) {
      return res.status(400).json({ message: 'All review fields are required' });
    }

    const exists = await Product.findById(product);
    if (!exists) return res.status(404).json({ message: 'Product not found' });

    const review = await Review.create({ product, name, rating, comment });
    await refreshProductRating(product);

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting review', error: err.message });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews across the store (Admin only, for moderation)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name').sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching reviews', error: err.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (Admin only)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await refreshProductRating(review.product);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
});

module.exports = router;

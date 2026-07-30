// routes/orders.js
// Public: place a Cash-on-Delivery order, track an order by ID.
// Admin (protected): view all orders, update order status.

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/auth');

// Generates a short, human-friendly order ID like SHQ-48213
function generateOrderId() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SHQ-${random}`;
}

// @route   POST /api/orders
// @desc    Place a new Cash on Delivery order
router.post('/', async (req, res) => {
  try {
    const { customer, items, shippingFee = 0 } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer details and items are required' });
    }

    // Recalculate totals server-side for integrity (never trust client-sent prices)
    let itemsTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      const unitPrice = product.discountPrice || product.price;
      itemsTotal += unitPrice * item.quantity;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    // Ensure a unique human-friendly order ID
    let orderId;
    let exists = true;
    while (exists) {
      orderId = generateOrderId();
      exists = await Order.findOne({ orderId });
    }

    const order = await Order.create({
      orderId,
      customer,
      items: verifiedItems,
      itemsTotal,
      shippingFee,
      grandTotal: itemsTotal + Number(shippingFee),
      paymentMethod: 'Cash on Delivery',
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// @route   GET /api/orders/track/:orderId
// @desc    Public order tracking by orderId (e.g. SHQ-48213)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) return res.status(404).json({ message: 'No order found with that ID' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error tracking order', error: err.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching orders', error: err.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Error updating order status', error: err.message });
  }
});

module.exports = router;

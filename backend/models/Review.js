// models/Review.js
// Customer product reviews. Admin can moderate (approve/delete) via dashboard.

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
    approved: {
      type: Boolean,
      default: true, // set to false if you want admin to approve before showing publicly
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

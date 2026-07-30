// models/Product.js
// Product schema - covers Men/Women/Kids and Stitched/Unstitched sub-categories.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number, // optional sale price, shown with strike-through on original
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ['Men', 'Women', 'Kids'],
    },
    type: {
      type: String,
      required: true,
      enum: ['Stitched', 'Unstitched'],
    },
    fabric: {
      type: String, // e.g. Lawn, Khaddar, Cotton, Linen
      default: '',
    },
    sizes: {
      type: [String], // e.g. ['S','M','L','XL'] or ['Unstitched'] for unstitched pieces
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    images: {
      type: [String], // array of image URLs
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false, // shown on homepage "Featured Products"
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index to support keyword search on name/description/fabric
productSchema.index({ name: 'text', description: 'text', fabric: 'text' });

module.exports = mongoose.model('Product', productSchema);

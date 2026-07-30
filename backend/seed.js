// seed.js
// One-time script to create the initial admin account + sample products.
// Run with: node seed.js
// (Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: "Women's Embroidered Lawn Suit",
    description: 'Premium 3-piece embroidered lawn suit with chiffon dupatta, perfect for festive occasions.',
    price: 6900,
    discountPrice: 5900,
    category: 'Women',
    type: 'Unstitched',
    fabric: 'Lawn',
    sizes: ['Unstitched'],
    colors: ['Maroon', 'Teal'],
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800'],
    stock: 25,
    featured: true,
    isNewArrival: true,
  },
  {
    name: "Men's Classic Kurta Shalwar",
    description: 'Tailored, ready-to-wear kurta shalwar in premium khaddar fabric.',
    price: 4500,
    category: 'Men',
    type: 'Stitched',
    fabric: 'Khaddar',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Off White'],
    images: ['https://images.unsplash.com/photo-1622470953794-3f2a17b8b6ca?w=800'],
    stock: 40,
    featured: true,
  },
  {
    name: "Kids' Printed Cotton Frock",
    description: 'Soft, breathable cotton frock with playful prints, made for all-day comfort.',
    price: 2200,
    category: 'Kids',
    type: 'Stitched',
    fabric: 'Cotton',
    sizes: ['2-3Y', '4-5Y', '6-7Y'],
    colors: ['Pink', 'Yellow'],
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800'],
    stock: 30,
    featured: true,
  },
];

const runSeed = async () => {
  await connectDB();

  try {
    // --- Seed Admin ---
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const existingAdmin = await Admin.findOne({ email });
    if (!existingAdmin) {
      await Admin.create({ name: 'Shaneeq Admin', email, password });
      console.log(`✅ Admin account created: ${email}`);
    } else {
      console.log('ℹ️  Admin account already exists, skipping.');
    }

    // --- Seed Products (only if the collection is empty) ---
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`✅ Inserted ${sampleProducts.length} sample products.`);
    } else {
      console.log('ℹ️  Products already exist, skipping sample insert.');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🌱 Seeding complete. Connection closed.');
  }
};

runSeed();

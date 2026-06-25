const Product = require('../models/Product');

/**
 * @desc    Get all catalog products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ price: 1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private (Admin/Superadmin)
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed default logistics products if the collection is empty
 */
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.create([
        {
          name: 'Express Document Envelope',
          description: 'Sleek, lightweight, waterproof protective envelope for corporate documents, contracts, and certificates.',
          price: 5.99,
          image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
          category: 'Document',
          weightClass: 'light'
        },
        {
          name: 'Standard Parcel Box',
          description: 'Standard cardboard shipping box ideal for small appliances, shoes, books, and household utilities.',
          price: 14.50,
          image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200',
          category: 'Parcel',
          weightClass: 'light'
        },
        {
          name: 'Fragile Electronics Carton',
          description: 'Double-walled impact-resistant corrugated carton with customized styrofoam spacing for heavy laptops, screens, and components.',
          price: 32.00,
          image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200',
          category: 'Fragile',
          weightClass: 'medium'
        },
        {
          name: 'Heavy Duty Cargo Pallet',
          description: 'Fumigated wooden cargo shipping pallet designed for heavy industrial components, batteries, and machinery.',
          price: 120.00,
          image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=200',
          category: 'Freight',
          weightClass: 'heavy'
        }
      ]);
      console.log('Seeded default cargo products into MongoDB');
    }
  } catch (error) {
    console.error('Error seeding catalog products:', error.message);
  }
};

module.exports = {
  getProducts,
  createProduct,
  seedProducts
};

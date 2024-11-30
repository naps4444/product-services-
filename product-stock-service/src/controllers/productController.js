const db = require('../models/db');

/**
 * POST /products
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  const { plu, name } = req.body;
  try {
    const [id] = await db('products').insert({ plu, name }).returning('id');
    res.status(201).json({ message: 'Product created', productId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
};

/**
 * GET /products
 * Get products with filters
 */
exports.getProducts = async (req, res) => {
  const { name, plu } = req.query;
  try {
    const query = db('products');

    if (name) query.where('name', 'ilike', `%${name}%`);
    if (plu) query.where('plu', plu);

    const results = await query.select('id', 'plu', 'name');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
};

const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Knex.js
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Initialize Express application
const app = express();
app.use(bodyParser.json());

/**
 * POST /products
 * Create a new product
 */
app.post('/products', async (req, res) => {
  const { plu, name } = req.body;
  try {
    const [id] = await db('products').insert({ plu, name }).returning('id');
    res.status(201).json({ message: 'Product created', productId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

/**
 * POST /stock
 * Create a new stock entry
 */
app.post('/stock', async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } = req.body;
  try {
    const [id] = await db('stock').insert({
      product_id,
      shop_id,
      quantity_on_shelf: quantity_on_shelf || 0,
      quantity_in_order: quantity_in_order || 0,
    }).returning('id');
    res.status(201).json({ message: 'Stock entry created', stockId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stock entry', details: error.message });
  }
});

/**
 * PUT /stock/:id
 * Update stock quantities
 */
app.put('/stock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity_on_shelf, quantity_in_order } = req.body;
  try {
    await db('stock').where({ id }).update({
      ...(quantity_on_shelf !== undefined && { quantity_on_shelf }),
      ...(quantity_in_order !== undefined && { quantity_in_order }),
    });
    res.status(200).json({ message: 'Stock updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock', details: error.message });
  }
});

/**
 * GET /stock
 * Get stock entries with filters
 */
app.get('/stock', async (req, res) => {
  const { plu, shop_id, quantity_on_shelf_min, quantity_on_shelf_max, quantity_in_order_min, quantity_in_order_max } = req.query;
  try {
    const query = db('stock').join('products', 'stock.product_id', 'products.id');

    if (plu) query.where('products.plu', plu);
    if (shop_id) query.where('stock.shop_id', shop_id);
    if (quantity_on_shelf_min) query.where('stock.quantity_on_shelf', '>=', quantity_on_shelf_min);
    if (quantity_on_shelf_max) query.where('stock.quantity_on_shelf', '<=', quantity_on_shelf_max);
    if (quantity_in_order_min) query.where('stock.quantity_in_order', '>=', quantity_in_order_min);
    if (quantity_in_order_max) query.where('stock.quantity_in_order', '<=', quantity_in_order_max);

    const results = await query.select(
      'stock.id',
      'products.plu',
      'stock.shop_id',
      'stock.quantity_on_shelf',
      'stock.quantity_in_order'
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock entries', details: error.message });
  }
});

/**
 * GET /products
 * Get products with filters
 */
app.get('/products', async (req, res) => {
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
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Product Stock Service running on http://localhost:${PORT}`);
});

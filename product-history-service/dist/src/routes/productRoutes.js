import { Router } from 'express';
import { dataSource } from '../server.js'; // Ensure proper extension for ESM
import { Action } from '../entities/Action.js';

const router = Router();

// Reusable function to validate fields
const validateFields = (fields, res) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      res.status(400).json({ error: `${key} is required` });
      return false;
    }
  }
  return true;
};

// Route to log a product action
router.post('/log', async (req, res, next) => {
  try {
    const { action_type, product_id, shop_id, quantity_changed } = req.body;

    // Validate required fields
    if (!validateFields({ action_type, product_id, shop_id, quantity_changed }, res)) return;

    if (!dataSource.isInitialized) {
      res.status(500).json({ error: 'Database not initialized' });
      return;
    }

    // Create and save the action
    const actionRepository = dataSource.getRepository(Action);
    const newAction = actionRepository.create({
      action: action_type,
      product_id,
      details: `Shop ID: ${shop_id}, Quantity Changed: ${quantity_changed}`,
      timestamp: new Date(),
    });

    const result = await actionRepository.save(newAction);
    res.status(201).json({ message: 'Action logged successfully', actionId: result.id });
  } catch (error) {
    next(error);
  }
});

// Fetch all product actions
router.get('/products', async (req, res, next) => {
  try {
    if (!dataSource.isInitialized) {
      res.status(500).json({ error: 'Database not initialized' });
      return;
    }

    const actionRepository = dataSource.getRepository(Action);
    const actions = await actionRepository.find();
    res.status(200).json(actions);
  } catch (error) {
    next(error);
  }
});

// Error-handling middleware
router.use((error, req, res, next) => {
  console.error('An error occurred:', error.message);
  res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
});

export default router;

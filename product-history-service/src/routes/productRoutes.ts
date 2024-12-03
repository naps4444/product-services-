import { Router, Request, Response, NextFunction } from 'express';
import { dataSource } from '../server';
import { Action } from '../entities/Action';

interface ActionRequestBody {
  action_type: string;
  product_id: number;
  shop_id: number;
  quantity_changed: number;
}

const router = Router();

// Reusable function to validate fields
const validateFields = (fields: Record<string, any>): void => {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      throw new Error(`${key} is required`);
    }
  }
};

// Route to log a product action
router.post('/log', async (req: Request<{}, {}, ActionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action_type, product_id, shop_id, quantity_changed } = req.body;

    // Validate required fields
    validateFields({ action_type, product_id, shop_id, quantity_changed });

    if (!dataSource.isInitialized) {
      res.status(500).json({ error: 'Database not initialized' });
      return;
    }

    // Create and save the action instance
    const actionRepository = dataSource.getRepository(Action);
    const newAction = actionRepository.create({
      action_type,
      product_id,
      shop_id,
      quantity_changed,
      details: `Shop ID: ${shop_id}, Quantity Changed: ${quantity_changed}`,
      date: new Date(),
    });

    const result = await actionRepository.save(newAction);

    res.status(201).json({
      message: 'Action logged successfully',
      actionId: result.id, // Result should directly provide the ID
    });
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('is required')) {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

// Fetch all product actions
router.get('/products', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
router.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('An error occurred:', error.message);
  res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
});

export default router;

import { Action } from './entities/Action';
import 'reflect-metadata';
import 'dotenv/config';
import bodyParser from 'body-parser';
import { DataSource } from 'typeorm';
import router from './routes/productRoutes.js';
import express, { Request, Response, NextFunction } from 'express';

// Initialize Express application
const app = express();
app.use(bodyParser.json()); // Parse JSON requests

// Debugging environment variables
console.log('DB Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create and configure the TypeORM DataSource
console.log('Creating data source...');
export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Action],
  synchronize: true, // Automatically syncs schema with the database
  logging: true, // Optional: Log SQL queries for debugging
});

// Connect to the database
dataSource
  .initialize()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error(
      'Database connection error:',
      error instanceof Error ? error.message : error
    );
  });

// Reusable function to validate fields (throws an error if validation fails)
const validateFields = (fields: Record<string, any>): void => {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      throw new Error(`${key} is required`);
    }
  }
};

// Define the /log route with debugging
app.post('/log', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request body:', req.body);

    const { product_id, shop_id, quantity_changed, action_type } = req.body;

    // Validate required fields
    if (!product_id || typeof product_id !== 'number') {
      res.status(400).json({ error: 'Invalid or missing product_id' });
      return; // Early exit
    }
    if (!shop_id || typeof shop_id !== 'number') {
      res.status(400).json({ error: 'Invalid or missing shop_id' });
      return; // Early exit
    }
    if (!quantity_changed || typeof quantity_changed !== 'number') {
      res.status(400).json({ error: 'Invalid or missing quantity_changed' });
      return; // Early exit
    }
    if (!action_type || typeof action_type !== 'string' || action_type.trim() === '') {
      res.status(400).json({ error: 'Invalid or missing action_type' });
      return; // Early exit
    }

    if (!dataSource.isInitialized) {
      res.status(500).json({ error: 'Database not initialized' });
      return; // Early exit
    }

    // Create and save the action instance
    const newAction = new Action();
    newAction.product_id = product_id;
    newAction.shop_id = shop_id;
    newAction.quantity_changed = quantity_changed;
    newAction.action_type = action_type;
    newAction.details = `Shop ID: ${shop_id}, Quantity Changed: ${quantity_changed}`;
    newAction.date = new Date();

    console.log('Saving new Action:', newAction);

    await dataSource.manager.save(Action, newAction);

    console.log('Action saved successfully:', newAction);
    res.status(201).json({ message: 'Action logged successfully.' });
  } catch (error) {
    console.error('Error occurred while logging action:', error);
    res.status(500).json({
      error: 'Failed to log action',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});



// Use the product routes
console.log('Setting up product routes');
app.use('/api', router);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

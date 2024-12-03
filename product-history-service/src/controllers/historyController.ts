import { Request, Response } from 'express';
import { dataSource } from '../server';
import { Action } from '../entities/Action';

export const logHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action_type, shop_id, product_id, quantity_changed, details, date } = req.body;

    // Validate input
    if (typeof shop_id !== 'number') {
      res.status(400).json({ error: 'Invalid shop_id. It must be a number.' });
      return; // This ensures that we exit the function without continuing
    }

    if (typeof product_id !== 'number') {
      res.status(400).json({ error: 'Invalid product_id. It must be a number.' });
      return; // Exit after sending the response
    }

    if (typeof quantity_changed !== 'number') {
      res.status(400).json({ error: 'Invalid quantity_changed. It must be a number.' });
      return; // Exit after sending the response
    }

    if (typeof action_type !== 'string' || action_type.trim() === '') {
      res.status(400).json({ error: 'Invalid action_type. It must be a non-empty string.' });
      return; // Exit after sending the response
    }

    if (typeof details !== 'string' && !(typeof details === 'object' && details !== null && !Array.isArray(details))) {
      res.status(400).json({ error: 'Invalid details. It must be a string or a JSON object.' });
      return; // Exit after sending the response
    }

    const validDate = date ? new Date(date) : new Date();
    if (isNaN(validDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format.' });
      return; // Exit after sending the response
    }

    // Create a new Action instance
    const actionEntity = new Action();
    actionEntity.shop_id = shop_id;
    actionEntity.product_id = product_id;
    actionEntity.quantity_changed = quantity_changed;
    actionEntity.action_type = action_type;
    actionEntity.details = typeof details === 'string' ? details : JSON.stringify(details); // Ensure it's a string
    actionEntity.date = validDate;

    // Save to the database
    const actionRepository = dataSource.getRepository(Action);
    await actionRepository.save(actionEntity);

    res.status(201).json({ message: 'Product history logged successfully.' });
  } catch (error) {
    console.error('Error logging product history:', error);
    res.status(500).json({ error: 'Failed to log product history.' });
  }
};

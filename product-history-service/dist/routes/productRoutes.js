import { Router } from 'express';
import { dataSource } from '../server.js'; // Ensure the file path and extension are correct
import { Action } from '../entities/Action.js';
const router = Router();
// Route to log a product action
router.post('/log', async (req, res, next) => {
    try {
        const { action_type, product_id, shop_id, quantity_changed } = req.body;
        // Validate required fields
        if (!action_type || !product_id || !shop_id || !quantity_changed) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        // Create and save the action to the database
        const actionRepository = dataSource.getRepository(Action);
        const newAction = actionRepository.create({
            action_type,
            product_id,
            shop_id,
            quantity_changed,
            date: new Date(),
        });
        const result = await actionRepository.save(newAction);
        res.status(201).json({ message: 'Action logged successfully', actionId: result.id });
    }
    catch (error) {
        next(error); // Forward the error to error-handling middleware
    }
});
// Route to create a new product action
router.post('/products', async (req, res, next) => {
    try {
        const { action_type, product_id, shop_id, quantity_changed } = req.body;
        // Validate required fields
        if (!action_type || !product_id || !shop_id || !quantity_changed) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        // Create a new action
        const actionRepository = dataSource.getRepository(Action);
        const newAction = actionRepository.create({
            action_type,
            product_id,
            shop_id,
            quantity_changed,
            date: new Date(),
        });
        // Save the action to the database
        const result = await actionRepository.save(newAction);
        res.status(201).json({ message: 'Action created successfully', actionId: result.id });
    }
    catch (error) {
        next(error); // Forward the error to error-handling middleware
    }
});
// Route to fetch all product actions
router.get('/products', async (req, res, next) => {
    try {
        const actionRepository = dataSource.getRepository(Action);
        const actions = await actionRepository.find();
        res.status(200).json(actions);
    }
    catch (error) {
        next(error); // Forward the error to error-handling middleware
    }
});
// Error-handling middleware
router.use((error, req, res, next) => {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
});
export default router;

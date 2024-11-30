import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { DataSource } from 'typeorm';
import { Action } from './entities/Action.js';
import router from './routes/productRoutes.js';
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
export const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Action],
    synchronize: true, // Be cautious with synchronize in production
});
// Connect to the database
dataSource
    .initialize()
    .then(() => {
    console.log('Connected to the database');
})
    .catch((error) => {
    console.error('Database connection error:', error instanceof Error ? error.message : error);
});
// Define the /log route with debugging
app.post('/log', async (req, res) => {
    // Debugging: Log the request details
    console.log('Request received on /log:');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    try {
        const { action_type, product_id, shop_id, quantity_changed, date } = req.body;
        // Validate required fields
        if (!action_type || !product_id || !shop_id || !quantity_changed || !date) {
            res.status(400).json({ error: 'All fields are required.' });
            return;
        }
        const action = new Action(action_type, product_id, shop_id, quantity_changed, new Date(date));
        await dataSource.manager.save(action);
        res.status(201).json({
            message: 'Action logged successfully.',
            actionId: action.id,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error logging action:', error);
        res.status(500).send({ error: 'Failed to log action.' });
    }
});
// Use the product routes
app.use('/api', router);
// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;

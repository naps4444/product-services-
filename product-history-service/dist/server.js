"use strict";
require("reflect-metadata");
require("dotenv/config");
const bodyParser = require("body-parser");
const { DataSource } = require("typeorm");
const { Action } = require("./entities/Action.js");
const router = require("./routes/productRoutes.js");
const express = require("express");

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
exports.dataSource = new DataSource({
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
exports.dataSource
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

// Define the /log route with debugging
app.post('/log', async (req, res, next) => {
  try {
    console.log('Request body:', req.body);

    const { product_id, action, details, timestamp, action_type } = req.body; // Added `action_type`

    // Validate product_id is a number
    if (!product_id || typeof product_id !== 'number') {
      console.log('Validation failed: Invalid product_id.');
      res.status(400).json({ error: 'Invalid product_id. It must be an integer.' });
      return;
    }

    // Validate action is a non-empty string
    if (!action || typeof action !== 'string' || action.trim() === '') {
      console.log('Validation failed: Invalid action.');
      res.status(400).json({ error: 'Invalid action. It must be a non-empty string.' });
      return;
    }

    // Validate details is a non-empty string
    if (!details || typeof details !== 'string' || details.trim() === '') {
      console.log('Validation failed: Invalid details.');
      res.status(400).json({ error: 'Invalid details. It must be a non-empty string.' });
      return;
    }

    // Validate action_type is a non-empty string
    if (!action_type || typeof action_type !== 'string' || action_type.trim() === '') {
      console.log('Validation failed: Invalid action_type.');
      res.status(400).json({ error: 'Invalid action_type. It must be a non-empty string.' });
      return;
    }

    // Ensure timestamp is a valid date or set it to the current time
    const validTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(validTimestamp.getTime())) {
      console.log('Validation failed: Invalid timestamp format.');
      res.status(400).json({ error: 'Invalid timestamp format.' });
      return;
    }

    // Create a new Action instance
    const newAction = new Action();
    newAction.product_id = product_id;
    newAction.action = action;
    newAction.details = details;
    newAction.timestamp = validTimestamp;
    newAction.action_type = action_type; // Set `action_type` here

    console.log('Saving new Action:', newAction);

    // Save the action instance to the database
    await exports.dataSource.manager.save(Action, newAction);

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

module.exports = app;

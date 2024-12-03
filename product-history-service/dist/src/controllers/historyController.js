"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHistory = void 0;
const Action_1 = require("../../entities/Action");
const server_1 = require("../../server");
const logHistory = async (req, res) => {
    try {
        const { action, product_id, details, timestamp } = req.body;
        // Validate input
        if (!product_id || typeof product_id !== 'number') {
            return res.status(400).send({ error: 'Invalid product_id. It must be a number.' });
        }
        if (!action || typeof action !== 'string') {
            return res.status(400).send({ error: 'Invalid action. It must be a string.' });
        }
        if (!details || typeof details !== 'string') {
            return res.status(400).send({ error: 'Invalid details. It must be a string.' });
        }
        const validTimestamp = timestamp ? new Date(timestamp) : new Date();
        if (isNaN(validTimestamp.getTime())) {
            return res.status(400).send({ error: 'Invalid timestamp format.' });
        }
        // Create a new Action instance
        const actionEntity = new Action_1.Action();
        actionEntity.product_id = product_id;
        actionEntity.action = action;
        actionEntity.details = details;
        actionEntity.timestamp = validTimestamp;
        // Save to the database
        const actionRepository = server_1.dataSource.getRepository(Action_1.Action);
        await actionRepository.save(actionEntity);
        res.status(201).send({ message: 'Product history logged successfully.' });
    }
    catch (error) {
        console.error('Error logging product history:', error);
        res.status(500).send({ error: 'Failed to log product history.' });
    }
};
exports.logHistory = logHistory;

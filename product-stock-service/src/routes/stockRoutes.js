const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.post('/stock', stockController.createStock);
router.put('/stock/:id', stockController.updateStock);
router.get('/stock', stockController.getStock);

module.exports = router;

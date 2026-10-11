const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// GET /api/properties - Get all properties
router.get('/', propertyController.getAllProperties);

// GET /api/properties/featured - Get featured properties
router.get('/featured', propertyController.getFeaturedProperties);

// GET /api/properties/:id - Get a single property by ID
router.get('/:id', propertyController.getPropertyById);

module.exports = router;

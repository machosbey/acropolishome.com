const express = require('express');
const router = express.Router();
const { Property } = require('../models/Property');
const { Op } = require('sequelize');

// Helper to format dynamic property title: [category] في [location] [area] م²
function formatDynamicProperty(p) {
    const json = p && p.toJSON ? p.toJSON() : (p || {});
    const cat = (json.category && json.category.trim()) || 'عقار';
    let loc = '';
    if (json.location && json.location.trim()) {
        const trim = json.location.trim();
        loc = trim.startsWith('في ') ? trim : `في ${trim}`;
    }
    const area = json.area ? `${json.area} م²` : '';
    json.title = [cat, loc, area].filter(Boolean).join(' ') || json.title || 'عقار';
    return json;
}

// @route   GET /api/properties
// @desc    Get all properties (with optional filtering)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, status } = req.query;
        let whereClause = {};

        if (category) whereClause.category = category;
        if (status) whereClause.status = status;
        
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = Number(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = Number(maxPrice);
        }

        const properties = await Property.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(properties.map(formatDynamicProperty));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET /api/properties/featured
// @desc    Get featured properties
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const featuredProperties = await Property.findAll({
            where: { is_featured: true },
            order: [['createdAt', 'DESC']],
            limit: 8
        });
        res.json(featuredProperties.map(formatDynamicProperty));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET /api/properties/:property_code
// @desc    Get single property
// @access  Public
router.get('/:property_code', async (req, res) => {
    try {
        const property = await Property.findOne({ 
            where: { property_code: req.params.property_code } 
        });
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        
        res.json(formatDynamicProperty(property));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;

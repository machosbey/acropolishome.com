const express = require('express');
const router = express.Router();
const { Property } = require('../models/Property');

// @route   POST /api/admin/properties
// @desc    Add a new property
// @access  Private
router.post('/', async (req, res) => {
    try {
        const savedProperty = await Property.create(req.body);
        res.status(201).json(savedProperty);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/admin/properties
// @desc    Get all properties for dashboard
// @access  Private
router.get('/', async (req, res) => {
    try {
        const properties = await Property.findAll({ order: [['createdAt', 'DESC']] });
        res.json(properties);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/admin/properties/:id
// @desc    Update a property completely
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        await Property.update(req.body, { where: { id: req.params.id } });
        const updatedProperty = await Property.findByPk(req.params.id);
        res.json(updatedProperty);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/admin/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        await Property.destroy({ where: { id: req.params.id } });
        res.json({ msg: 'Property deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/admin/properties/:id/status
// @desc    Quickly update property status
// @access  Private
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Property.update({ status }, { where: { id: req.params.id } });
        const updatedProperty = await Property.findByPk(req.params.id);
        res.json(updatedProperty);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/admin/properties/:id/feature
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/feature', async (req, res) => {
    try {
        const { is_featured } = req.body;
        await Property.update({ is_featured }, { where: { id: req.params.id } });
        const updatedProperty = await Property.findByPk(req.params.id);
        res.json(updatedProperty);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

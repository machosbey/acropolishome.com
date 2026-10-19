const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Property } = require('../models/Property');

const propertyDir = path.join(__dirname, '../public/property');
if (!fs.existsSync(propertyDir)) {
    fs.mkdirSync(propertyDir, { recursive: true });
}

// Helper to save Base64 images into the property folder and return relative URL paths
function processAndSaveImages(images, propCode = 'prop') {
    if (!Array.isArray(images)) return [];
    return images.map((img, idx) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
            const matches = img.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (matches) {
                let ext = matches[1].toLowerCase();
                if (ext === 'jpeg') ext = 'jpg';
                if (ext.includes('+')) ext = 'png';
                const cleanCode = (propCode || 'prop').replace(/[^a-zA-Z0-9_-]/g, '');
                const filename = `${cleanCode}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
                const filePath = path.join(propertyDir, filename);
                fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                return `/property/${filename}`;
            }
        }
        return img;
    });
}

// @route   POST /api/admin/properties/upload
// @desc    Direct upload endpoint for image(s) to /property folder
// @access  Private
router.post('/upload', async (req, res) => {
    try {
        const { images, image, property_code } = req.body;
        const toProcess = images || (image ? [image] : []);
        const savedPaths = processAndSaveImages(toProcess, property_code);
        res.json({ urls: savedPaths, url: savedPaths[0] || null });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/admin/properties
// @desc    Add a new property
// @access  Private
router.post('/', async (req, res) => {
    try {
        if (req.body.images && Array.isArray(req.body.images)) {
            req.body.images = processAndSaveImages(req.body.images, req.body.property_code);
        }
        const savedProperty = await Property.create(req.body);
        res.status(201).json(savedProperty);
    } catch (err) {
        console.error('Create property error:', err);
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
        console.error('Get properties error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/admin/properties/:id
// @desc    Update a property completely using instance method for proper Sequelize getters/setters
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'العقار غير موجود' });
        }

        if (req.body.images && Array.isArray(req.body.images)) {
            req.body.images = processAndSaveImages(req.body.images, req.body.property_code || property.property_code);
        }

        // Keep existing property code if not provided
        if (!req.body.property_code) {
            req.body.property_code = property.property_code;
        }

        // Updating via instance ensures Sequelize runs custom setters (e.g. JSON stringify for features)
        await property.update(req.body);
        await property.reload();
        
        res.json(property);
    } catch (err) {
        console.error('Update property error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/admin/properties/:id
// @desc    Delete a property and clean up its images in /property folder
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (property && property.images && Array.isArray(property.images)) {
            property.images.forEach(imgUrl => {
                if (typeof imgUrl === 'string' && imgUrl.startsWith('/property/')) {
                    const filename = path.basename(imgUrl);
                    const filePath = path.join(propertyDir, filename);
                    if (fs.existsSync(filePath)) {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }
                }
            });
        }
        await Property.destroy({ where: { id: req.params.id } });
        res.json({ msg: 'Property deleted successfully' });
    } catch (err) {
        console.error('Delete property error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/admin/properties/:id/status
// @desc    Quickly update property status
// @access  Private
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ error: 'العقار غير موجود' });
        await property.update({ status });
        res.json(property);
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH /api/admin/properties/:id/feature
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/feature', async (req, res) => {
    try {
        const { is_featured } = req.body;
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ error: 'العقار غير موجود' });
        await property.update({ is_featured });
        res.json(property);
    } catch (err) {
        console.error('Feature update error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

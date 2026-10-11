const properties = require('../data/mockProperties.json');

// @desc    Get all properties (with optional filtering)
// @route   GET /api/properties
exports.getAllProperties = (req, res) => {
    try {
        let result = properties;

        // Simple filtering example
        if (req.query.type) {
            result = result.filter(p => p.type === req.query.type);
        }
        if (req.query.city) {
            result = result.filter(p => p.location.city === req.query.city);
        }

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
exports.getFeaturedProperties = (req, res) => {
    try {
        const featured = properties.filter(p => p.isFeatured);
        res.status(200).json({
            success: true,
            count: featured.length,
            data: featured
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
exports.getPropertyById = (req, res) => {
    try {
        const property = properties.find(p => p.id === req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

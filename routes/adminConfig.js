const express = require('express');
const router = express.Router();
const { Category } = require('../models/Category');
const { PropertyStatus } = require('../models/PropertyStatus');

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.findAll();
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const newCat = await Category.create({ name });
        res.status(201).json(newCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STATUSES ---
router.get('/statuses', async (req, res) => {
    try {
        const statuses = await PropertyStatus.findAll();
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/statuses', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const newStatus = await PropertyStatus.create({ name });
        res.status(201).json(newStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CONTACT INFO ---
const { ContactInfo } = require('../models/ContactInfo');

router.get('/contact', async (req, res) => {
    try {
        let contact = await ContactInfo.findByPk(1);
        if (!contact) {
            contact = await ContactInfo.create({
                id: 1,
                phone: '+30 21 0123 4567',
                email: 'info@acropolis-home.gr',
                address: 'اليونان، أثينا، منطقة الأكروبوليس'
            });
        } else if (contact.address && contact.address.includes('السعودية')) {
            contact = await contact.update({
                phone: '+30 21 0123 4567',
                email: 'info@acropolis-home.gr',
                address: 'اليونان، أثينا، منطقة الأكروبوليس'
            });
        }
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { requireSuperAdmin } = require('./auth');

router.put('/contact', requireSuperAdmin, async (req, res) => {
    try {
        let contact = await ContactInfo.findByPk(1);
        if (!contact) {
            contact = await ContactInfo.create({ id: 1, ...req.body });
        } else {
            await contact.update(req.body);
        }
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SITE SETTINGS ---
const SiteSettings = require('../models/SiteSettings');

router.get('/settings', async (req, res) => {
    try {
        let settings = await SiteSettings.findByPk(1);
        if (!settings) {
            settings = await SiteSettings.create({ id: 1 });
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/settings', requireSuperAdmin, async (req, res) => {
    try {
        let settings = await SiteSettings.findByPk(1);
        if (!settings) {
            settings = await SiteSettings.create({ id: 1, ...req.body });
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const fs = require('fs');
const path = require('path');

router.put('/settings/logo', requireSuperAdmin, async (req, res) => {
    try {
        const { logoBase64 } = req.body;
        if (!logoBase64) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // The base64 string comes as "data:image/png;base64,iVBORw0KGgo..."
        const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid base64 image data' });
        }

        const imageBuffer = Buffer.from(matches[2], 'base64');
        const logoPath = path.join(__dirname, '../public/UPLOADS/LOGO.png');
        
        fs.writeFileSync(logoPath, imageBuffer);

        res.json({ success: true, message: 'Logo updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save logo' });
    }
});

module.exports = router;

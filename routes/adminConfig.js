const express = require('express');
const router = express.Router();
const { Category } = require('../models/Category');
const { PropertyStatus } = require('../models/PropertyStatus');
const { authenticateAdmin, requireSuperAdmin } = require('./auth');

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.findAll();
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const newCat = await Category.create({ name });
        res.status(201).json(newCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const cat = await Category.findByPk(id);
        if (!cat) return res.status(404).json({ error: 'التصنيف غير موجود' });
        await cat.destroy();
        res.json({ message: 'تم حذف التصنيف بنجاح' });
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

router.post('/statuses', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const newStatus = await PropertyStatus.create({ name });
        res.status(201).json(newStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/statuses/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const statusItem = await PropertyStatus.findByPk(id);
        if (!statusItem) return res.status(404).json({ error: 'الحالة غير موجودة' });
        await statusItem.destroy();
        res.json({ message: 'تم حذف الحالة بنجاح' });
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
                phone: '',
                email: '',
                address: '',
                whatsapp: '',
                instagram: '',
                twitter: '',
                snapchat: '',
                tiktok: ''
            });
        }
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/contact', [authenticateAdmin, requireSuperAdmin], async (req, res) => {
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

// Role-based authorization for Site Settings (prepared for future role delegation)
const canManageSettings = (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'غير مصرح' });
    const allowedRoles = ['super_admin', 'settings_manager', 'admin_settings'];
    if (allowedRoles.includes(req.admin.role)) {
        return next();
    }
    return res.status(403).json({ error: 'صلاحية مرفوضة: لا تملك صلاحية إدارة إعدادات الموقع' });
};

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

router.put('/settings', [authenticateAdmin, canManageSettings], async (req, res) => {
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

router.put('/settings/logo', [authenticateAdmin, canManageSettings], async (req, res) => {
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

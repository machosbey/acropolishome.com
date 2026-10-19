require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize, Property } = require('./models/Property');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure property images directory exists
const propertyDir = path.join(__dirname, 'public', 'property');
if (!fs.existsSync(propertyDir)) {
    fs.mkdirSync(propertyDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Property Images & Static Frontend Files
app.use('/property', express.static(propertyDir));
app.use(express.static(path.join(__dirname, 'public', 'frontend')));
app.use('/frontend', express.static(path.join(__dirname, 'public', 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite via Sequelize
require('./models/Category');
require('./models/PropertyStatus');
require('./models/ContactInfo');
require('./models/SiteSettings');
require('./models/Admin');
const { Admin } = require('./models/Admin');

sequelize.sync({ alter: true })
.then(async () => {
    console.log('✅ Connected to SQLite Database Successfully');
    // Seed default Super Admin if none exists
    const adminCount = await Admin.count();
    if (adminCount === 0) {
        await Admin.create({
            name: 'المدير العام',
            username: 'admin',
            password: 'password123',
            role: 'super_admin'
        });
        console.log('🌟 Default Super Admin Created (username: admin, password: password123)');
    }

    // Auto-migrate any existing Base64 images from database to the /property folder
    try {
        const allProperties = await Property.findAll();
        for (const prop of allProperties) {
            let images = prop.images;
            if (typeof images === 'string') {
                try { images = JSON.parse(images); } catch(e) { images = []; }
            }
            if (Array.isArray(images) && images.length > 0) {
                let hasBase64 = false;
                const updatedImages = images.map((img, idx) => {
                    if (typeof img === 'string' && img.startsWith('data:image/')) {
                        hasBase64 = true;
                        const matches = img.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                        if (matches) {
                            let ext = matches[1].toLowerCase();
                            if (ext === 'jpeg') ext = 'jpg';
                            if (ext.includes('+')) ext = 'png';
                            const cleanCode = (prop.property_code || 'prop').replace(/[^a-zA-Z0-9_-]/g, '');
                            const filename = `${cleanCode}_${Date.now()}_${idx}.${ext}`;
                            const filePath = path.join(propertyDir, filename);
                            fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                            return `/property/${filename}`;
                        }
                    }
                    return img;
                });
                if (hasBase64) {
                    prop.images = updatedImages;
                    await prop.save();
                    console.log(`🖼️ Migrated Base64 images for property ${prop.property_code} to /property/ folder.`);
                }
            }
        }
    } catch (migErr) {
        console.error('Image migration note:', migErr.message);
    }
})
.catch(err => console.error('❌ SQLite Connection Error:', err));

// --- Basic Routes Setup ---

// Public APIs
app.use('/api/properties', require('./routes/publicProperties'));

// Auth API
const { router: authRouter, authenticateAdmin, requireSuperAdmin } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Admin APIs (Protected)
app.use('/api/admin/properties', authenticateAdmin, require('./routes/adminProperties'));
// Settings & Config APIs (GET is public for site visitors; modifications are protected inside adminConfig.js)
app.use('/api/admin/config', require('./routes/adminConfig'));

// Fallback Route for Frontend (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🌍 Frontend is accessible at http://localhost:${PORT}/frontend/index.html`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models/Property');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Static Frontend Files
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

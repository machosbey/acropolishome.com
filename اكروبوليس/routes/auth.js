const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Admin } = require('../models/Admin');

// Middleware to authenticate token
const authenticateAdmin = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    
    try {
        const admin = await Admin.findOne({ where: { session_token: token } });
        if (!admin) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        req.admin = admin;
        next();
    } catch(err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Middleware to authorize Super Admin
const requireSuperAdmin = (req, res, next) => {
    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }
    next();
};

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

        if (!admin.validPassword(password)) {
            return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        admin.session_token = token;
        await admin.save();

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token: token,
            admin: {
                id: admin.id,
                name: admin.name,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// @route GET /api/auth/me
router.get('/me', authenticateAdmin, (req, res) => {
    res.json({
        id: req.admin.id,
        name: req.admin.name,
        username: req.admin.username,
        role: req.admin.role
    });
});

// @route GET /api/auth/users
// @desc Get all admins (Super Admin only)
router.get('/users', authenticateAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const admins = await Admin.findAll({ attributes: ['id', 'name', 'username', 'role'] });
        res.json(admins);
    } catch(err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route POST /api/auth/users
// @desc Create new admin (Super Admin only)
router.post('/users', authenticateAdmin, requireSuperAdmin, async (req, res) => {
    try {
        // Enforce role limitation requested by user (only allow adding 'editor')
        const role = req.body.role === 'super_admin' ? 'super_admin' : 'editor'; // Wait, user said super admin can only add editor. But if backend restricts it, I will enforce it here.
        if (role === 'super_admin') return res.status(403).json({ error: 'لا يمكنك إضافة مدير عام جديد' });

        const newAdmin = await Admin.create({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            role: 'editor'
        });
        
        res.json({ id: newAdmin.id, name: newAdmin.name, username: newAdmin.username, role: newAdmin.role });
    } catch(err) {
        res.status(400).json({ error: 'تعذر إنشاء الحساب، قد يكون اسم المستخدم موجوداً مسبقاً.' });
    }
});

// @route DELETE /api/auth/users/:id
// @desc Delete admin (Super Admin only)
router.delete('/users/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
    try {
        if (req.params.id == req.admin.id) return res.status(400).json({ error: 'لا يمكنك حذف حسابك الخاص' });
        await Admin.destroy({ where: { id: req.params.id } });
        res.json({ msg: 'Deleted' });
    } catch(err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = { router, authenticateAdmin, requireSuperAdmin };

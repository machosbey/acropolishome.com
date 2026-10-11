const { Admin } = require('./models/Admin');
const { sequelize } = require('./models/Property');
const crypto = require('crypto');

async function updatePassword() {
    try {
        await sequelize.authenticate();
        let admin = await Admin.findOne({ where: { username: 'admin' } });
        if (!admin) {
            admin = await Admin.create({
                name: 'المدير العام',
                username: 'admin',
                password: 'password', // will be replaced
                role: 'super_admin'
            });
        }
        
        // Force the hash to ensure it matches
        admin.password = crypto.createHash('sha256').update('0995111035').digest('hex');
        await admin.save({ hooks: false }); // disable hooks to avoid double hashing since we hashed it manually

        console.log('✅ Password successfully updated to 0995111035');
    } catch (err) {
        console.error(err);
    }
}

updatePassword();

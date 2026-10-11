const fs = require('fs');
const { Admin } = require('./models/Admin');
const { sequelize } = require('./models/Property');

async function checkAdmins() {
    await sequelize.authenticate();
    const admins = await Admin.findAll();
    let out = "ADMINS IN DB:\n";
    admins.forEach(a => {
        out += `ID: ${a.id}, Username: ${a.username}, Role: ${a.role}\n`;
    });
    fs.writeFileSync('./admin-dump.txt', out);
}

checkAdmins();

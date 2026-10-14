const fs = require('fs');
const { ContactInfo } = require('./models/ContactInfo');
const { sequelize } = require('./models/Property');

async function checkContact() {
    await sequelize.authenticate();
    const c = await ContactInfo.findByPk(1);
    fs.writeFileSync('./contact-dump.txt', JSON.stringify(c ? c.toJSON() : 'NONE', null, 2));
}

checkContact();

const { Admin } = require('./models/Admin');
const { sequelize } = require('./models/Property');

async function testDelete() {
    await sequelize.authenticate();
    const adminToDelete = await Admin.findOne({ where: { role: 'editor' } });
    if (adminToDelete) {
        console.log("Found admin to delete:", adminToDelete.username, "ID:", adminToDelete.id);
        await Admin.destroy({ where: { id: adminToDelete.id } });
        console.log("Admin deleted successfully.");
    } else {
        console.log("No editor admin found.");
    }
}

testDelete();

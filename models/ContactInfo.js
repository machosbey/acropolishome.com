const { DataTypes } = require('sequelize');
const { sequelize } = require('./Property');

const ContactInfo = sequelize.define('ContactInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1 // Force single row
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    whatsapp: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    instagram: { type: DataTypes.STRING, allowNull: true },
    twitter: { type: DataTypes.STRING, allowNull: true },
    snapchat: { type: DataTypes.STRING, allowNull: true },
    tiktok: { type: DataTypes.STRING, allowNull: true }
});

module.exports = { ContactInfo };

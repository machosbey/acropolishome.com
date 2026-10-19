const { DataTypes } = require('sequelize');
const { sequelize } = require('./Property');

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = { Category };

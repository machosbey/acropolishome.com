const { DataTypes } = require('sequelize');
const { sequelize } = require('./Property');

const PropertyStatus = sequelize.define('PropertyStatus', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = { PropertyStatus };

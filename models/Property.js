const { Sequelize, DataTypes } = require('sequelize');

// Initialize SQLite database (creates a local file database.sqlite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Property = sequelize.define('Property', {
  property_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  price_type: { type: DataTypes.STRING, defaultValue: 'بيع' },
  location: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  bedrooms: { type: DataTypes.INTEGER, allowNull: false },
  bathrooms: { type: DataTypes.INTEGER, allowNull: false },
  area: { type: DataTypes.FLOAT, allowNull: false },
  map_link: { type: DataTypes.STRING, allowNull: true },
  
  // SQLite doesn't natively support arrays/objects, so we store them as JSON strings
  features: { 
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
        const rawValue = this.getDataValue('features');
        return rawValue ? JSON.parse(rawValue) : [];
    },
    set(val) {
        this.setDataValue('features', JSON.stringify(val));
    }
  },
  additional_details: { 
    type: DataTypes.TEXT, 
    defaultValue: '{}',
    get() {
        const rawValue = this.getDataValue('additional_details');
        return rawValue ? JSON.parse(rawValue) : {};
    },
    set(val) {
        this.setDataValue('additional_details', JSON.stringify(val));
    }
  },
  images: { 
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
        const rawValue = this.getDataValue('images');
        return rawValue ? JSON.parse(rawValue) : [];
    },
    set(val) {
        this.setDataValue('images', JSON.stringify(val));
    }
  },
  status: { type: DataTypes.STRING, defaultValue: 'متاح للبيع' },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = { sequelize, Property };

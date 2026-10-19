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
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;
        try {
            return JSON.parse(rawValue);
        } catch(e) {
            return [];
        }
    },
    set(val) {
        if (typeof val === 'string') {
            this.setDataValue('features', val);
        } else {
            this.setDataValue('features', JSON.stringify(val || []));
        }
    }
  },
  additional_details: { 
    type: DataTypes.TEXT, 
    defaultValue: '{}',
    get() {
        const rawValue = this.getDataValue('additional_details');
        if (!rawValue) return {};
        if (typeof rawValue === 'object' && !Array.isArray(rawValue)) return rawValue;
        try {
            return JSON.parse(rawValue);
        } catch(e) {
            return {};
        }
    },
    set(val) {
        if (typeof val === 'string') {
            this.setDataValue('additional_details', val);
        } else {
            this.setDataValue('additional_details', JSON.stringify(val || {}));
        }
    }
  },
  images: { 
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
        const rawValue = this.getDataValue('images');
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;
        try {
            return JSON.parse(rawValue);
        } catch(e) {
            return [];
        }
    },
    set(val) {
        if (typeof val === 'string') {
            this.setDataValue('images', val);
        } else {
            this.setDataValue('images', JSON.stringify(val || []));
        }
    }
  },
  structural_specs: { 
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
        const rawValue = this.getDataValue('structural_specs');
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;
        try {
            return JSON.parse(rawValue);
        } catch(e) {
            return [];
        }
    },
    set(val) {
        if (typeof val === 'string') {
            this.setDataValue('structural_specs', val);
        } else {
            this.setDataValue('structural_specs', JSON.stringify(val || []));
        }
    }
  },
  status: { type: DataTypes.STRING, defaultValue: 'متاح للبيع' },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = {
  sequelize,
  Property
};

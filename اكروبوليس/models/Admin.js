const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { sequelize } = require('./Property');

const Admin = sequelize.define('Admin', {
  name: { 
      type: DataTypes.STRING, 
      allowNull: false 
  },
  username: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
  },
  password: { 
      type: DataTypes.STRING, 
      allowNull: false 
  },
  role: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'editor' // 'super_admin' or 'editor'
  },
  session_token: {
      type: DataTypes.STRING,
      allowNull: true
  }
}, {
  hooks: {
      beforeCreate: (admin) => {
          if (admin.password) {
              admin.password = crypto.createHash('sha256').update(admin.password).digest('hex');
          }
      },
      beforeUpdate: (admin) => {
          if (admin.changed('password')) {
              admin.password = crypto.createHash('sha256').update(admin.password).digest('hex');
          }
      }
  }
});

Admin.prototype.validPassword = function(password) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return this.password === hash;
};

module.exports = { Admin };

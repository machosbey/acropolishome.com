const { DataTypes } = require('sequelize');
const { sequelize } = require('./Property');

const SiteSettings = sequelize.define('SiteSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    site_name: { type: DataTypes.STRING, defaultValue: 'أكروبوليس هوم' },
    hero_title: { type: DataTypes.STRING, defaultValue: 'اكتشف عقار أحلامك <br> <span class="text-[#E5B158] block mt-4">بين أرقى الخيارات</span>' },
    hero_subtitle: { type: DataTypes.TEXT, defaultValue: 'الوجهة الأولى للعقارات الفاخرة والاستثنائية. ابحث في قائمة متجددة من الفلل العصرية والشقق الفندقية الفارهة في قلب أثينا وبالقرب من الأكروبوليس.' },
    currency: { type: DataTypes.STRING, defaultValue: 'يورو' },
    hero_config: { type: DataTypes.TEXT, allowNull: true }
}, {
    timestamps: false
});

module.exports = SiteSettings;

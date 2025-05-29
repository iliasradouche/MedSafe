require('dotenv').config();
const sequelize = require('./src/database');
const { User } = require('./src/models');

(async () => {
  try {
    await sequelize.sync();


    const adminEmail = 'admin@example.com';
    const adminPassword = '12345678';

    const [admin, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: 'Administrator',
        passwordHash: adminPassword, 
        role: 'ADMIN',
      },
    });

    if (created) {
      console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
  } finally {
    process.exit();
  }
})();

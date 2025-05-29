const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dayOfWeek: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'availabilities',
  underscored: true
});

module.exports = Availability;
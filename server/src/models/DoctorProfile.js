const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DoctorProfile = sequelize.define('DoctorProfile', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  licenseNumber: { type: DataTypes.STRING, allowNull: false },
  specialization:{ type: DataTypes.STRING, allowNull: false },
  phone:         DataTypes.STRING,
  address:       DataTypes.TEXT
}, { tableName: 'doctor_profiles' });

module.exports = DoctorProfile;

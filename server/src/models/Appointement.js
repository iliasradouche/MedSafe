const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'appointments'
})

module.exports = Appointment

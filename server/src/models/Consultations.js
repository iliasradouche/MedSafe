const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Consultation = sequelize.define('Consultation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'consultations'
})

module.exports = Consultation

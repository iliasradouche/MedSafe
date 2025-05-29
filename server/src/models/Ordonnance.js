const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Ordonnance = sequelize.define('Ordonnance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'ordonnances'
})

module.exports = Ordonnance

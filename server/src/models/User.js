const { DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
const sequelize = require('../database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'MEDECIN', 'PATIENT'),
    allowNull: false,
    defaultValue: 'PATIENT'
  }
},
{
  tableName: 'users',
  hooks: {
    beforeCreate: async user => {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10)
    }
  }
})


User.prototype.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

module.exports = User

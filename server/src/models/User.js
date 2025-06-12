'use strict';
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
  static associate(models) {
    // A user can be a patient or a doctor (profile), and can own many appointments, consultations & availabilities as “medecin”
    User.hasOne(models.Patient, {
      foreignKey: 'user_id',
      as: 'patient'
    });
    User.hasOne(models.DoctorProfile, {
      foreignKey: 'user_id',
      as: 'doctorProfile'
    });
    User.hasMany(models.Appointment, {
      foreignKey: 'medecin_id',
      as: 'appointments'
    });
    User.hasMany(models.Consultation, {
      foreignKey: 'medecin_id',
      as: 'consultations'
    });
    User.hasMany(models.Availability, {
      foreignKey: 'doctor_id',
      as: 'availabilities'
    });
  }
}


  User.init({
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
      allowNull: false,
      field: 'password_hash'
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MEDECIN', 'PATIENT'),
      allowNull: false,
      defaultValue: 'PATIENT'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,  // set to true if you have createdAt/updatedAt
    hooks: {
      beforeCreate: async (user) => {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  });

  return User;
};

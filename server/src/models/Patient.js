// models/patient.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    static associate(models) {
      models.User.hasMany(Patient,      { foreignKey: 'user_id', as: 'patients' });
      Patient.belongsTo(models.User,    { foreignKey: 'user_id', as: 'user' });
      Patient.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
      Patient.hasMany(models.Consultation, { foreignKey: 'patient_id', as: 'consultations' });
    }
  }

  Patient.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dossierNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    emergencyContact: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: false
  });

  return Patient;
};

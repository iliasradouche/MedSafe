'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
        as: 'patient'
      });
      Appointment.belongsTo(models.User, {
        foreignKey: 'medecin_id',
        as: 'doctor'
      });
    }
  }

  Appointment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patientId: {
        type: DataTypes.INTEGER,
        field: 'patient_id',
        allowNull: true
      },
      medecinId: {
        type: DataTypes.INTEGER,
        field: 'medecin_id',
        allowNull: true
      },
      dateTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
        defaultValue: 'PENDING'
      }
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'appointments',
      timestamps: true // Enable createdAt and updatedAt
    }
  );

  return Appointment;
};
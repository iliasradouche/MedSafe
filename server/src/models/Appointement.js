// Updated Appointment model
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Patient, {
        foreignKey: "patient_id",
        as: "patient",
      });
      Appointment.belongsTo(models.User, {
        foreignKey: "medecin_id",
        as: "doctor",
      });
    }
  }

  Appointment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patientId: {
        type: DataTypes.INTEGER,
        field: "patient_id",
        allowNull: true,
      },
      medecinId: {
        type: DataTypes.INTEGER,
        field: "medecin_id",
        allowNull: true,
      },
      // New separated fields
      appointmentDate: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD format
        field: "appointment_date",
        allowNull: false,
      },
      appointmentTime: {
        type: DataTypes.TIME, // HH:MM:SS format
        field: "appointment_time",
        allowNull: false,
      },
      // Keep the original for backward compatibility during transition
      dateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "CONFIRMED", "CANCELLED"),
        defaultValue: "PENDING",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Appointment",
      tableName: "appointments",
      timestamps: true,
    }
  );

  return Appointment;
};

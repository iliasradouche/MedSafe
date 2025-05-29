const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dossierNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    emergencyContact: {
      type: DataTypes.STRING,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "patients",
  }
);

module.exports = Patient;

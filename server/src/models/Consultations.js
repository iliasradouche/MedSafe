'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
class Consultation extends Model {
  static associate(models) {
    Consultation.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    Consultation.belongsTo(models.User, {
      foreignKey: 'medecin_id',
      as: 'doctor'
    });
    Consultation.hasMany(models.Ordonnance, {
      foreignKey: 'consultation_id',
      as: 'ordonnances'
    });
  }
}


  Consultation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    medecinId: {
    type: DataTypes.INTEGER,
    field: 'medecin_id',
    allowNull: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    field: 'patient_id',
    allowNull: true
  },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Consultation',
    tableName: 'consultations',
    timestamps: false   // enable if you have createdAt/updatedAt columns
  });

  return Consultation;
};

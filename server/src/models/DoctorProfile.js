'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
class DoctorProfile extends Model {
  static associate(models) {
    DoctorProfile.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    // if you ever want to load availabilities from the profile (through the user):
    // DoctorProfile.hasMany(models.Availability, { foreignKey: 'doctor_id', as: 'availabilities' });
    // DoctorProfile.hasMany(models.Consultation, { foreignKey: 'medecin_id', as: 'consultations' });
  }
}


  DoctorProfile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: true
  },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
     ville: {                      
    type: DataTypes.STRING,
    allowNull: true
  }
  }, {
    sequelize,
    modelName: 'DoctorProfile',
    tableName: 'doctor_profiles',
    underscored: true,   // remove if you don't use snake_case columns
    timestamps: false    // enable if you have createdAt/updatedAt
  });

  return DoctorProfile;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
class Availability extends Model {
  static associate(models) {
    Availability.belongsTo(models.User, {
      foreignKey: 'doctor_id',
      as: 'doctor'
    });
  }
}


  Availability.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
      doctorId: {
    type: DataTypes.INTEGER,
    field: 'doctor_id',
    allowNull: true
  },
    dayOfWeek: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Availability',
    tableName: 'availabilities',
    underscored: true,
    timestamps: false  // remove if you have createdAt/updatedAt
  });

  return Availability;
};

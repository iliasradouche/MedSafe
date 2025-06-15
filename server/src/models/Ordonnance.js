'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
class Ordonnance extends Model {
  static associate(models) {
    Ordonnance.belongsTo(models.Consultation, {
      foreignKey: 'consultation_id',
      as: 'consultation'
    });
  }
}


  Ordonnance.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    consultationId: {
    type: DataTypes.INTEGER,
    field: 'consultation_id',
    allowNull: true
  },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Ordonnance',
    tableName: 'ordonnances',
    timestamps: true    // set to true if you have createdAt/updatedAt columns
  });

  return Ordonnance;
};

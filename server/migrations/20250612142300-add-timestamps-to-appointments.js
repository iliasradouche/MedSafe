'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Default to current timestamp
    });
    await queryInterface.addColumn('appointments', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Default to current timestamp
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'), // Automatically update on row modification
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'createdAt');
    await queryInterface.removeColumn('appointments', 'updatedAt');
  }
};
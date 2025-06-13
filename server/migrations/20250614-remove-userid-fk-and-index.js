'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // replace 'patients_ibfk_1' with your real FK name
    await queryInterface.removeConstraint('patients', 'patients_ibfk_1');
    await queryInterface.removeIndex('patients', 'user_id');
    await queryInterface.removeColumn('patients', 'user_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('patients', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addIndex('patients', ['user_id'], {
      name: 'user_id',
    });
    await queryInterface.addConstraint('patients', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'patients_ibfk_1',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};

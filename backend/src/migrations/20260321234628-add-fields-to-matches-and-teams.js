'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campos a Matches
    await queryInterface.addColumn('Matches', 'placeholderA', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Matches', 'placeholderB', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Matches', 'advancesToMatchId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Matches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Agregar groupId a Teams para asignar equipos a zonas
    await queryInterface.addColumn('Teams', 'groupId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Teams', 'groupId');
    await queryInterface.removeColumn('Matches', 'advancesToMatchId');
    await queryInterface.removeColumn('Matches', 'placeholderB');
    await queryInterface.removeColumn('Matches', 'placeholderA');
  }
};

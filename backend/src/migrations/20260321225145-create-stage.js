'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Stages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      tournamentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tournaments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('GROUP_STAGE', 'KNOCKOUT_STAGE'),
        allowNull: false
      },
      numberOfCourts: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    // Drop the enum type if we are on postgres
    await queryInterface.dropTable('Stages');
    // Note: in some dialects, dropping the table doesn't drop the enum automatically.
    // However, Sequelize doesn't always handle this well across dialects.
  }
};

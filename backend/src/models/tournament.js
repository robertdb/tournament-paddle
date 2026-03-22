'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Tournament extends Model {
    static associate(models) {
      Tournament.hasMany(models.Stage, {
        foreignKey: 'tournamentId',
        as: 'stages'
      });
    }
  }

  Tournament.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numberOfCourts: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    }
  }, {
    sequelize,
    modelName: 'Tournament',
    tableName: 'Tournaments'
  });

  return Tournament;
};

'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.Stage, {
        foreignKey: 'stageId',
        as: 'stage'
      });
      Group.hasMany(models.Match, {
        foreignKey: 'groupId',
        as: 'matches'
      });
      Group.hasMany(models.Team, {
        foreignKey: 'groupId',
        as: 'teams'
      });
    }
  }

  Group.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stageId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numberOfTeams: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Group',
    tableName: 'Groups'
  });

  return Group;
};

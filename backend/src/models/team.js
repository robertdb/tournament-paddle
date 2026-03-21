'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Team extends Model {
    static associate(models) {
      // define association here
    }
  }

  Team.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    playerA_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playerA_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 9 }
    },
    playerB_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playerB_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 9 }
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'preloaded',
      validate: {
        isIn: [['preloaded', 'checked_in']]
      }
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Team',
    tableName: 'Teams'
  });

  return Team;
};
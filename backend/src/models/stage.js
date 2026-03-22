'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Stage extends Model {
    static associate(models) {
      Stage.belongsTo(models.Tournament, {
        foreignKey: 'tournamentId',
        as: 'tournament'
      });
      Stage.hasMany(models.Group, {
        foreignKey: 'stageId',
        as: 'groups'
      });
      Stage.hasMany(models.Match, {
        foreignKey: 'stageId',
        as: 'matches'
      });
    }
  }

  Stage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tournamentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('GROUP_STAGE', 'KNOCKOUT_STAGE'),
      allowNull: false
    },
    numberOfCourts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Stage',
    tableName: 'Stages'
  });

  return Stage;
};

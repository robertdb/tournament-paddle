'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.Stage, {
        foreignKey: 'stageId',
        as: 'stage'
      });
      Match.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'group'
      });
      Match.belongsTo(models.Team, {
        foreignKey: 'teamA_id',
        as: 'teamA'
      });
      Match.belongsTo(models.Team, {
        foreignKey: 'teamB_id',
        as: 'teamB'
      });
      Match.belongsTo(models.Match, {
        foreignKey: 'advancesToMatchId',
        as: 'advancesToMatch'
      });
    }
  }

  Match.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stageId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    round: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teamA_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    teamB_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    scoreA: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    scoreB: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending'
    },
    courtNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    placeholderA: {
      type: DataTypes.STRING,
      allowNull: true
    },
    placeholderB: {
      type: DataTypes.STRING,
      allowNull: true
    },
    advancesToMatchId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Match',
    tableName: 'Matches'
  });

  return Match;
};

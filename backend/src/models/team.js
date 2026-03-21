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
      unique: {
        msg: 'El teléfono ya está registrado para otro equipo.'
      },
      set(value) {
        // Normalización: Eliminar caracteres no numéricos para evitar duplicados "sucios"
        if (value) {
          const normalized = `${value}`.replace(/\D/g, '');
          this.setDataValue('contactPhone', normalized);
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'preloaded',
      validate: {
        isIn: [['preloaded', 'checked_in']]
      }
    },
    checked_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
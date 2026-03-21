const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración común desde .env
const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

// Configuración para sequelize-cli (usa la misma config para dev y prod)
module.exports = {
  development: dbConfig,
  production: dbConfig,
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  }
};

// Instancia de Sequelize para usar en la app
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos PostgreSQL establecida con éxito.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
  }
};

module.exports.sequelize = sequelize;
module.exports.testConnection = testConnection;

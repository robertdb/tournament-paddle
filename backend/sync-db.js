const db = require('./src/models');

async function sync() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión establecida.');
    await db.sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar:', error);
    process.exit(1);
  }
}

sync();

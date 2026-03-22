const express = require('express');
const cors = require('cors');
const path = require('path');
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

let swaggerDocument;
try {
    swaggerDocument = yaml.load(path.join(__dirname, 'src', 'docs', 'swagger.yaml'));
} catch (error) {
    console.error('❌ Error cargando swagger.yaml:', error.message);
}

const { testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Main App Routes soon to be mounted here
const teamRoutes = require('./src/routes/team.routes');
const tournamentRoutes = require('./src/routes/tournament.routes');

app.use('/api/teams', teamRoutes);
app.use('/api/tournament', tournamentRoutes);

app.get('/ping', (req, res) => {
    res.json({ status: 'success', message: 'Pong!' });
});

// Exportar la app para testing
module.exports = app;

// Levantar el servidor y probar la BD (solo si no estamos en test)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log(`🚀 Servidor base corriendo en http://localhost:${PORT}`);
        await testConnection();
    });
}


const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Datos simulados en memoria (Base de Datos temporal)
const participants = [
    { id: 1, players: [{ name: "Juan", level: 4 }, { name: "Pedro", level: 5 }], reconfirmed: true, pairLevel: 4.5, pairName: "Juan / Pedro" },
    { id: 2, players: [{ name: "Ana", level: 3 }, { name: "Maria", level: 6 }], reconfirmed: true, pairLevel: 4.5, pairName: "Ana / Maria" }
];

let groupSimulation = {
    name: "Grupo A",
    pairs: participants,
    matches: [
        {
            id: "match_1",
            pairA: 1,
            pairB: 2,
            status: "PENDING",
            court: null,
            result: null
        }
    ]
};

// 1. Endpoint Público: Obtener estado del torneo (Grupos y Partidos)
app.get('/api/public/tournament', (req, res) => {
    res.json({
        status: "success",
        data: {
            group: groupSimulation,
            nextMatchesSuggested: groupSimulation.matches.filter(m => m.status === 'PENDING')
        }
    });
});

// 2. Endpoint Admin: Cargar un resultado (6.4 Actualización vía HTTP)
app.post('/api/admin/matches/:id/result', (req, res) => {
    const { id } = req.params;
    const { score, winnerId } = req.body;

    const matchIndex = groupSimulation.matches.findIndex(m => m.id === id);
    if (matchIndex === -1) {
        return res.status(404).json({ error: "Partido no encontrado" });
    }

    if (groupSimulation.matches[matchIndex].status !== 'PENDING') {
        return res.status(400).json({ error: "El partido ya tiene un resultado cargado." });
    }

    // Actualizar resultado del partido
    groupSimulation.matches[matchIndex] = {
        ...groupSimulation.matches[matchIndex],
        status: "COMPLETED",
        result: { score, winnerId }
    };

    // Aquí iría la lógica de: "Actualiza tabla de grupos, Define clasificados, Desbloquea partidos"

    res.json({
        message: "Resultado cargado exitosamente. Recalculando prioridades de juego...",
        updatedMatch: groupSimulation.matches[matchIndex]
    });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor del Torneo de Pádel corriendo en http://localhost:${PORT}`);
    console.log(`📌 Endpoints disponibles:`);
    console.log(`   - GET  http://localhost:${PORT}/api/public/tournament`);
    console.log(`   - POST http://localhost:${PORT}/api/admin/matches/:id/result`);
});

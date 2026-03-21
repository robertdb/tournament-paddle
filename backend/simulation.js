
/**
 * Torneo de Pádel - Simulación de Carga Inicial
 * Implementando la lógica definida en el documento de especificación.
 */

// 1. Definición de Participantes (Parejas)
const participants = [
    {
        id: 1,
        players: [
            { name: "Juan", level: 4 },
            { name: "Pedro", level: 5 }
        ],
        reconfirmed: true
    },
    {
        id: 2,
        players: [
            { name: "Ana", level: 3 },
            { name: "Maria", level: 6 }
        ],
        reconfirmed: true
    }
];

// 2. Lógica del Sistema (Core) - 6.1 Ranking de parejas
function calculatePairLevel(pair) {
    const sum = pair.players.reduce((acc, player) => acc + player.level, 0);
    return sum / pair.players.length;
}

// 3. Simulación de ejecución
console.log("🚀 Iniciando Simulación de Torneo de Pádel...");
console.log("-------------------------------------------");

// Procesar parejas y calcular ranking
const processedPairs = participants.map(pair => {
    const pairLevel = calculatePairLevel(pair);
    return {
        ...pair,
        pairLevel,
        pairName: `${pair.players[0].name} / ${pair.players[1].name}`
    };
});

console.log("📌 Parejas Reconfirmadas (Check-in):");
processedPairs.forEach(p => {
    console.log(` - ${p.pairName} | Nivel: ${p.pairLevel}`);
});

// 4. Generación de Grupo (6.2)
const groupSimulation = {
    name: "Grupo A",
    pairs: processedPairs,
    matches: [
        {
            id: "match_1",
            pairA: processedPairs[0].id,
            pairB: processedPairs[1].id,
            status: "PENDING",
            court: null
        }
    ]
};

console.log("\n🧪 Estado del Grupo Generado:");
console.log(JSON.stringify(groupSimulation, null, 2));

// 5. Scheduling Inteligente (6.3) - Sugerencia básica
console.log("\n🧠 Sugerencia de Scheduling:");
if (groupSimulation.matches[0].status === "PENDING") {
    console.log(`👉 Sugerencia: El partido [${processedPairs[0].pairName} vs ${processedPairs[1].pairName}] debe entrar a Cancha 1.`);
}

console.log("-------------------------------------------");
console.log("✅ Simulación completada.");

# Feature Specification: Bracket & Match Generation View

## Objetivo
Nutrir al torneo único de la aplicación con todos los partidos pendientes y sus reglas de cruce predefinidas. Además, cambiar la respuesta original de creación, y agregar endpoints de lectura para visualizar la estructura del torneo, los participantes confirmados y el detalle de cada cruce.

## 1. Reglas de Cruces y Clasificación
- **Torneo Único:** El sistema gestionará un único torneo activo. No se requerirán UUIDs en las URLs principales del torneo.
- **Armado de Eliminatorias:** Los cruces de la Ronda Eliminatoria se generan vacíos pero con "etiquetas" (placeholders) que indican de dónde proviene el equipo (Ej. "1ro Zona 1 vs 2do Zona 2"). **Esto debe estar siempre y cuando los cruces no estén informados** (una vez finalizada la etapa previa, el placeholder cede su lugar a los equipos reales mostrando los nombres de los 2 participantes de cada pareja).
- **Partidos de Grupo:** Cada grupo generará automáticamente todos los cruces del tipo "Round Robin" de forma vacía. Cuando los equipos estén asignados al partido, la API deberá devolver el objeto completo con los nombres de los 2 participantes de cada equipo o pareja.

## 2. Modificaciones al Endpoint de Creación
### `POST /api/tournaments`
- **Cambio de Response:** En vez de retornar todo el torneo estructurado o su ID, simplemente retornará un `201 OK`.

**Response Esperado:**
```json
{
  "message": "Torneo creado con éxito"
}
```

## 3. Nuevos Endpoints de Visualización

### `GET /api/tournament`
Devuelve la información general del torneo, cómo quedaron armados los grupos con sus respectivos equipos (sin incluir estadísticas por ahora), y muestra la estructura completa del árbol de eliminatorias para identificar cómo avanza cada cruce (incluyendo de forma implícita el `nextMatchId` o avance).

**Response Esperado (Ejemplo Completo 2 Zonas y Semis a Final):**
```json
{
  "name": "Torneo Verano 2026",
  "stages": [
    {
      "type": "GROUP_STAGE",
      "groups": [
        {
          "id": "uuid-group-1",
          "name": "Zona 1",
          "teams": [
             { "id": "uuid-team1", "playerA": { "name": "Beto Gomez", "category": 2 }, "playerB": { "name": "Luis Garcia", "category": 3 } },
             { "id": "uuid-team2", "playerA": { "name": "Juan Perez", "category": 3 }, "playerB": { "name": "Martin Lopez", "category": 3 } },
             { "id": "uuid-team3", "playerA": { "name": "Carlos Rey", "category": 2 }, "playerB": { "name": "Pedro Paz", "category": 3 } }
          ]
        },
        {
          "id": "uuid-group-2",
          "name": "Zona 2",
          "teams": [
             { "id": "uuid-team4", "playerA": { "name": "Alan Rico", "category": 4 }, "playerB": { "name": "Bruno Diaz", "category": 3 } },
             { "id": "uuid-team5", "playerA": { "name": "Diego Sol", "category": 2 }, "playerB": { "name": "Enzo Mar", "category": 3 } },
             { "id": "uuid-team6", "playerA": { "name": "Fede Cruz", "category": 1 }, "playerB": { "name": "Gabi Luz", "category": 1 } }
          ]
        }
      ]
    },
    {
      "type": "KNOCKOUT_STAGE",
      "matches": [
        {
          "id": "uuid-match-semis-1",
          "round": "SEMIFINALS",
          "placeholderA": "1ro Zona 1",
          "placeholderB": "2do Zona 2",
          "teamA": null,
          "teamB": null,
          "scoreA": null,
          "scoreB": null,
          "status": "pending",
          "advancesToMatchId": "uuid-match-final"
        },
        {
          "id": "uuid-match-semis-2",
          "round": "SEMIFINALS",
          "placeholderA": "1ro Zona 2",
          "placeholderB": "2do Zona 1",
          "teamA": null,
          "teamB": null,
          "scoreA": null,
          "scoreB": null,
          "status": "pending",
          "advancesToMatchId": "uuid-match-final"
        },
        {
          "id": "uuid-match-final",
          "round": "FINALS",
          "placeholderA": "Ganador Semifinal 1",
          "placeholderB": "Ganador Semifinal 2",
          "teamA": null,
          "teamB": null,
          "scoreA": null,
          "scoreB": null,
          "status": "pending",
          "advancesToMatchId": null
        }
      ]
    }
  ]
}
```

### `GET /api/tournament/matches`
Retorna todos los enfrentamientos del torneo, ideal para renderizar una lista plana o para la grilla de turnos de todos los grupos. **Aquí NO se anidan los "teams" bajo "groups", sino que se exponen como los dos contendientes en un partido (teamA vs teamB)**.

**Response Esperado:**
```json
[
  {
    "id": "uuid-match-9",
    "round": "GROUP_MATCH", 
    "status": "pending",
    "courtNumber": 1,
    "startTime": null,
    "placeholderA": "Equipo 1 - Zona 1", // Si aún no están confirmados dentro del cronograma
    "placeholderB": "Equipo 2 - Zona 1",
    "teamA": {
      "id": "uuid-team1",
      "playerA": { "name": "Beto Gomez" },
      "playerB": { "name": "Luis Garcia" }
    },
    "teamB": {
      "id": "uuid-team2",
      "playerA": { "name": "Juan Perez" },
      "playerB": { "name": "Martin Lopez" }
    },
    "scoreA": null,
    "scoreB": null
  }
]
```

### `GET /api/tournament/matches/:id`
Retorna la información atómica de un solo enfrentamiento con el mismo objeto individual que el listado anterior.

## 4. Cambios en Base de Datos
- **Modelo `Match`:** 
  - `placeholderA` y `placeholderB` (tipo `VARCHAR`).
  - Nuevo campo estructural opcional `advancesToMatchId` (tipo `UUID`) para construir el árbol e indicar a qué partido "pasa" el ganador. También podría ser "advancesToMatch" que guarda una relación self-referencing.

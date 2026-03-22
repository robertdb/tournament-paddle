# Plan de Ejecución: Prueba de Torneo Único (End-to-End)

## Objetivo
Validar la operatoria completa utilizando comandos `cURL` en un ambiente local (`http://localhost:3001`), simulando la interacción que tendría un cliente (frontend). Este plan abarca desde la carga de los participantes hasta la generación y visualización de un torneo de 7 equipos.

## Paso a Paso Esperado

### 1. Precarga y Alta de 7 Equipos (POST /api/teams)
Simularemos el alta manual desde un dashboard de administrador. Se ejecutarán 7 peticiones de manera individual para registrar cada grupo y se registrarán sus `UUIDs` devueltos (los IDs deberán copiarse y pegarse para el próximo paso).

**Payloads JSON a ejecutar:**
1. `{"playerA": {"name": "Juan Perez", "category": 5}, "playerB":{"name": "Martin Lopez", "category": 5}, "contactPhone": "11111111"}`
2. `{"playerA": {"name": "Beto Gomez", "category": 5}, "playerB":{"name": "Luis Garcia", "category": 4}, "contactPhone": "22222222"}`
3. `{"playerA": {"name": "Carlos Rey", "category": 6}, "playerB":{"name": "Pedro Paz", "category": 6}, "contactPhone": "33333333"}`
4. `{"playerA": {"name": "Diego Sol", "category": 4}, "playerB":{"name": "Enzo Mar", "category": 5}, "contactPhone": "44444444"}`
5. `{"playerA": {"name": "Fede Cruz", "category": 7}, "playerB":{"name": "Gabi Luz", "category": 7}, "contactPhone": "55555555"}`
6. `{"playerA": {"name": "Hugo Juez", "category": 5}, "playerB":{"name": "Ivan Flor", "category": 5}, "contactPhone": "66666666"}`
7. `{"playerA": {"name": "Keko Van", "category": 6}, "playerB":{"name": "Leo Mar", "category": 6}, "contactPhone": "77777777"}`

_Archivo resultante a generar:_ `curl-POST-create-team.txt`

### 2. Check-in de los Equipos Inscritos (PUT /api/teams/:id)
Dado que los equipos se crean por defecto con el status de "no presentados", se ejecutará una petición PUT por cada UUID de la etapa 1 informando su asistencia mediante el flag `checked_in: true`.

**Payload JSON a ejecutar (por cada ID de equipo):**
```json
{
  "checked_in": true
}
```

_Archivo resultante a generar:_ `curl-PUT-checkin-team.txt`

### 3. Generación Inicial del Torneo (POST /api/tournament)
Se lanzará el request para crear un Torneo que organizará los 7 equipos de la siguiente manera:
- **GROUP_STAGE:** **1 grupo de 4** equipos y **1 grupo de 3** equipos.
- **KNOCKOUT_STAGE:** Partiendo desde **Semifinales** (`SEMIFINALS`).

**Payload JSON a ejecutar:**
```json
{
  "name": "Torneo Testing End-to-End",
  "numberOfCourts": 2,
  "stages": [
    {
      "order": 1,
      "type": "GROUP_STAGE",
      "config": {
        "groupsOf4": 1,
        "groupsOf3": 1,
        "teamsAdvancingPerGroup": 2

      }
    },
    {
      "order": 2,
      "type": "KNOCKOUT_STAGE",
      "config": {
        "startingRound": "SEMIFINALS"
      }
    }
  ]
}
```

_Archivo resultante a generar:_ `curl-POST-create-tournament.txt`

### 4. Consultar la Estructura (GET /api/tournament)
Realizaremos un llamado GET para traer el "Overview". Deberá devolver el array de etapas (`stages`), y la conformación de la Zona 1 y la Zona 2 con sus integrantes vacíos o asignados.
*(Recordatorio: los equipos creados en los pasos 1 y 2 actualmente no se asignan automáticamente por el backend a las zonas del torneo recién creado, esa es una lógica interna manual de drag & drop, pero el árbol se retornará de forma idéntica).*

**Payload JSON a ejecutar:** `(Sin body)`

_Archivo resultante a generar:_ `curl-GET-overview-tournament.txt`

### 5. Consultar los Partidos y Llaves Eliminatorias (GET /api/tournament/matches)
El último endpoint devolverá la grilla total de partidos de las zonas (9 partidos en total generados a partir de los grupos 4 y 3) y los enfrentamientos de Semifinales y Final con un status `pending`.

**Payload JSON a ejecutar:** `(Sin body)`

_Archivo resultante a generar:_ `curl-GET-matches-tournament.txt`

### 6. Consultar un Partido Específico (GET /api/tournament/matches/:id)
Por simplicidad en la comprobación, copiaremos uno de los UUIDs retornados en el listado masivo anterior y lo pasaremos por este endpoint para chequear cómo consulta de manera atómica la API.

**Payload JSON a ejecutar:** `(Sin body)`

_Archivo resultante a generar:_ `curl-GET-match-by-id.txt`

---
> **Nota de Implementación:** Se guardará un script o un archivo `.txt` separado para cada uno de los requests cURL por prolijidad en el mismo directorio que este plan (`specs/feature-bracket-generation/`).

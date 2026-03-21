# 🎾 Especificación Técnica Completa: Padel Tournament System

Este documento es la única fuente de verdad para el desarrollo del backend. Contiene el modelo de datos, la API y las reglas de negocio necesarias para un torneo de grupos y eliminación directa.

---

## 1. 📋 Fase 0: Precarga e Inscripciones
Antes del evento, se realiza la carga de los equipos inscritos para tener la base de datos lista.
- **Datos requeridos:** Nombres de los dos jugadores, teléfono de contacto y nivel promedio (`avg_level`).
- **Estado inicial:** Los equipos se registran con `checked_in: false`. Solo quienes confirmen asistencia el día del torneo entran en el sorteo.

---

## 2. 🗄️ Modelo de Datos (PostgreSQL)

```sql
-- Tabla de Equipos (Parejas)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    player1_name VARCHAR(100) NOT NULL,
    player2_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    avg_level FLOAT NOT NULL,           -- Nivel para el balanceo (1.0 a 7.0)
    checked_in BOOLEAN DEFAULT FALSE,   -- Confirmación presencial el día del torneo
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha/hora de inscripción para desempates
    status VARCHAR(20) DEFAULT 'active' -- active, eliminated, winner
);

-- Tabla de Grupos
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,          -- Ej: "Grupo A", "Grupo B"
    stage VARCHAR(20) DEFAULT 'groups'
);

-- Tabla de Posiciones (Standings)
CREATE TABLE group_standings (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    team_id INTEGER REFERENCES teams(id),
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0            -- 3 por victoria, 0 por derrota
);

-- Tabla de Partidos (Matches)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id),
    group_id INTEGER REFERENCES groups(id), -- NULL en eliminación directa
    court_number INTEGER,                   -- Asignación manual de cancha (1 o 2)
    status VARCHAR(20) DEFAULT 'pending',   -- pending, playing, finished
    score_t1 INTEGER DEFAULT 0,
    score_t2 INTEGER DEFAULT 0,
    winner_id INTEGER REFERENCES teams(id),
    stage VARCHAR(50),                      -- 'Group', 'Quarterfinals', 'Semifinals', 'Final'
    next_match_id INTEGER                   -- ID del siguiente partido en el cuadro
);
```

## 📝 3. Especificación API (OpenAPI 3.0 - YAML)

```yaml
openapi: 3.0.0
info:
  title: Padel Tournament API
  version: 1.5.0
  description: API completa para gestión de equipos, grupos y resultados.

paths:
  /teams:
    post:
      summary: Precarga de equipo
      tags: [Equipos]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                player1_name: { type: string }
                player2_name: { type: string }
                avg_level: { type: number }
                contact_phone: { type: string }
    get:
      summary: Listar equipos cargados
      tags: [Equipos]

  /teams/{id}/check-in:
    patch:
      summary: Confirmar asistencia (Día del evento)
      tags: [Operación]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }

  /tournament/generate:
    post:
      summary: Generar Grupos y Cuadro Inicial
      description: Ejecuta el algoritmo de serpentina con equipos presentes.
      tags: [Torneo]

  /matches/{id}/result:
    patch:
      summary: Cargar resultado de partido
      tags: [Operación]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                score_t1: { type: integer }
                score_t2: { type: integer }
```

## 🧠 4. Lógica de Implementación (Core Logic)

### 4.1 Algoritmo de Sorteo de Grupos (Serpentina)
Para garantizar grupos equilibrados y competitivos, el sistema realiza lo siguiente:
1.  **Filtro:** Toma únicamente equipos donde `checked_in` sea `true`.
2.  **Ordenamiento:** Clasifica los equipos por `avg_level` de mayor a menor.
3.  **Distribución en "S":** Reparte los equipos en los grupos disponibles de forma zigzagueante.
    *   **Ejemplo con 3 grupos:**
        *   Grupo A: 1°, 6°, 7°...
        *   Grupo B: 2°, 5°, 8°...
        *   Grupo C: 3°, 4°, 9°...

### 4.2 Progresión al Cuadro Final
Cuando un partido de grupo termina (`PATCH /matches/{id}/result`):
1.  Se actualizan los `group_standings` del grupo correspondiente.
2.  Si es el último partido del grupo, el sistema identifica al 1° y 2° lugar.
3.  Se promocionan a los equipos a los partidos de la fase eliminatoria (Quarterfinals o Semifinals) usando la columna `next_match_id` previamente generada.

### 4.3 Regla de Lucky Losers (Mejores No Clasificados)
Si la cantidad de grupos no permite llenar el cuadro de eliminación directa (ej. faltan parejas para completar 8):
1.  El sistema genera un ranking entre todos los equipos que quedaron en 3° lugar.
2.  Los criterios de desempate son:
    1.  Mayor cantidad de puntos.
    2.  Mejor diferencia de games (`games_won - games_lost`).
    3.  Mayor cantidad de `games_won`.
3.  Los mejores son asignados a los espacios vacíos del bracket.

### 4.4 Criterios de Desempate en Grupo
En caso de igualdad de puntos en la tabla de posiciones:
1.  **Enfrentamiento directo:** Resultado del partido entre los equipos empatados.
2.  **Diferencia de games:** Balance total en la fase de grupos (`games_won - games_lost`).
3.  **Tiempo de inscripción:** El equipo que se haya inscrito primero al torneo será favorecido (`registered_at`).
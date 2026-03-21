# Feature Specification: Create Tournament API

## Objetivo
Implementar el endpoint `POST /tournaments` con la responsabilidad exclusiva de registrar un torneo y estructurar sus etapas (clasificación, eliminatoria) reservando el cupo de equipos y la disposición de canchas correspondientes, según los parámetros recibidos. 

## Payload del Request Esperado
El payload debe permitir definir el nombre del torneo, la cantidad global de canchas, y un arreglo de etapas ordenadas donde cada una puede sobreescribir sus propias reglas, como la disposición exacta de los grupos o llaves eliminatorias.

```json
{
  "name": "Torneo de Pádel",
  "numberOfCourts": 3, 
  "stages": [
    {
      "order": 1,
      "type": "GROUP_STAGE",
      "numberOfCourts": 3, 
      "config": {
        "groupsOf4": 2,
        "groupsOf3": 1,
        "teamsAdvancingPerGroup": 2
      }
    },
    {
      "order": 2,
      "type": "KNOCKOUT_STAGE",
      "numberOfCourts": 1, 
      "config": {
        "startingRound": "QUARTER_FINALS"
      }
    }
  ]
}
```

## 1. Modificaciones en Base de Datos (Modelos)

Para soportar este modelo de datos, la estructura relacional requiere adaptabilidad para guardar la configuración dinámica de cada etapa.

### Modelo `Tournament`
- **Nuevos campos:**
  - `name`: `VARCHAR` (Obligatorio).
  - `numberOfCourts`: `INTEGER` (Opcional, Default: 2).

### Modelo `Stage` (Nueva Tabla)
- Relacionado 1 a N con `Tournament` (`tournamentId`).
- **Campos:**
  - `order`: `INTEGER` (1, 2, ...).
  - `type`: `ENUM('GROUP_STAGE', 'KNOCKOUT_STAGE')`.
  - `numberOfCourts`: `INTEGER` (Opcional, Default hereda del torneo padre).
  - `config`: `JSONB` o `JSON` (Para almacenar la configuración explícita, ideal para manejar las distinciones como `groupsOf4`, `groupsOf3` o `startingRound`).

## 2. Implementación de Controladores

### `src/controllers/tournament.controller.js`
- **Método `createTournament(req, res)`:**
  1. Validar cuerpo de la petición (Payload).
  2. Iniciar una transacción de base de datos (`sequelize.transaction`).
  3. **Paso A:** Crear el registro `Tournament`.
  4. **Paso B:** Iterar sobre el arreglo `stages` del request.
     - Asignar el valor de `numberOfCourts` (del Tournament) si viene nulo en el Stage.
     - Guardar el registro de cada `Stage` con su objeto `config` correspondiente mapeado a formato JSON.
  5. **Paso C (Estructural):** Dependiendo del `stage.type`, iniciar el proceso interno de reserva de espacios:
     - **Si es `GROUP_STAGE`:** Registrar los grupos vacíos en la tabla correspondiente (ej. `Group` o `Zone`) validando cuántos grupos de 4 y cuántos grupos de 3 se pidieron.
     - **Si es `KNOCKOUT_STAGE`:** Calcular y registrar la estructura del árbol vacía en la base de datos (según valor de `startingRound`) y dejar pendiente la vinculación de `teamsAdvancingPerGroup` de la etapa anterior.
  6. Finalizar la transacción (Commit) y responder con código `201 Created` y el torneo creado. En caso de error, Rollback de BD.

## 3. Rutas y Validaciones

### `src/routes/tournament.routes.js`
- Agregar o actualizar `POST /tournaments`.
- Incorporar **middlewares de validación** (ej. `express-validator` o `Joi/Zod`):
  - `name`: string requerido.
  - `stages`: arreglo requerido (length >= 1).
  - Dentro de `stages`, hacer iteraciones tipo _switch case_ por el `type` para validar que venga la `config` esperada. Por ejemplo, en `GROUP_STAGE` validar que exista `groupsOf4`.

## 4. Documentación API

### `src/docs/swagger.yaml`
- Crear el componente esquemático de `CreateTournamentRequest`.
- Documentar el campo opcional (`numberOfCourts`) e indicar su valor predeterminado si no se incluye en el Body.
- Agregar ejemplos claros del esquema JSON en el endpoint del `POST /tournaments` dentro del YAML.

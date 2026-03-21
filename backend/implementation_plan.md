# Plan de Implementación Backend: Precarga de Parejas

Este plan se centra exclusivamente en la funcionalidad de **Precarga de Parejas**. El objetivo es permitir que el administrador registre, liste, edite y elimine parejas (equipos) antes del inicio del torneo, alineando el backend con la estructura de datos que utiliza el frontend.

> [!IMPORTANT]
> **Regla de Oro:** Todo el código debe estar dentro de la carpeta `backend/`. El contrato de la API debe coincidir con el tipo `PlayersPair` usado por el frontend en `players-pairs.ts`.

---

## Paso 1: Alineación del Modelo de Datos (Sequelize)

**Objetivos:**
- Modificar el modelo `Team` para que coincida con los campos de negocio de la precarga.
- Campos requeridos en la tabla `Teams`:
  - `id`: UUID (para que el frontend pueda manejar IDs consistentes).
  - `playerA_name`: String.
  - `playerA_category`: Integer (1-9).
  - `playerB_name`: String.
  - `playerB_category`: Integer (1-9).
  - `contactPhone`: String (Único).
  - `status`: String (Default: 'preloaded').
  - `checkedInAt`: DateTime (Nullable).

**Validación:**
1. ¿La migración refleja exactamente estos campos?

---

## Paso 2: Contrato API (Swagger)

**Objetivos:**
- Actualizar `swagger.yaml` para reflejar la estructura anidada o plana que el frontend espera. 
- *Decisión:* Se recomienda usar un JSON plano para la persistencia pero que el controlador pueda recibir/enviar la estructura de `PlayersPair` (con objetos `playerA` y `playerB`) para facilitar el consumo del frontend.
- Documentar:
  - `POST /api/teams`: Crear pareja.
  - `GET /api/teams`: Listar todas.
  - `PUT /api/teams/:id`: Editar pareja.
  - `DELETE /api/teams/:id`: Eliminar pareja.

---

## Paso 3: Implementación del Controlador (CRUD Precarga)

**Objetivos:**
- Desarrollar `src/controllers/team.controller.js` con las 4 operaciones básicas.
- **Mapeo de Datos:** El controlador debe ser capaz de transformar la respuesta del modelo (plana) al formato que espera el frontend (anidada).
- **Validaciones de Negocio:**
  - Impedir duplicados por `contactPhone`.
  - Impedir duplicados por combinación de nombres (normalizados).
  - Validar categorías 1-9.

---

## Paso 4: Rutas y Middleware de Validación

**Objetivos:**
- Configurar `src/routes/team.routes.js`.
- (Opcional pero recomendado) Implementar un middleware de validación con `express-validator` o Joi para asegurar que los datos que entran al `POST` y `PUT` son correctos antes de llegar al controlador.

---

## Paso 5: Prueba de Integración Local

**Objetivos:**
- Levantar el servidor y validar con una herramienta como Postman/Thunder Client o la UI de Swagger.
- Asegurar que el `GET /api/teams` devuelve exactamente lo que el mock `MOCK_PRELOADED_PAIRS` contiene en su estructura.

**Resultado Final Esperado:** Un backend robusto que soporta todo el ciclo de vida de la "Precarga", listo para ser conectado al frontend real.


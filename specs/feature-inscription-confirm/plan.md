# Plan: Edición y Check-In de Equipos

## Objetivo
Implementar un endpoint genérico para la edición de datos de un equipo precargado y la gestión de su estado de inscripción (Check-In).

## Alcance Backend
- Reemplazar endpoints específicos por uno genérico: `PUT /api/teams/:id`.
- Implementar lógica inteligente para el campo `checked_in`.
- Asegurar que la fecha de check-in sea persistente una vez realizada (idempotencia).

## Contrato de API (Swagger)

**Endpoint:** `PUT /api/teams/{id}`

**Request Body:**
- `playerA`: `{ name, category }` (opcional)
- `playerB`: `{ name, category }` (opcional)
- `contactPhone`: `string` (opcional)
- `checked_in`: `boolean` (opcional)

**Lógica de Transición de Estados:**
1. **De `false` a `true`**: 
   - Cambiar `status` a `"checked_in"`.
   - Establecer `checkedInAt` a la fecha/hora actual del servidor.
2. **De `true` a `false`**:
   - Cambiar `status` a `"preloaded"`.
   - Limpiar `checkedInAt` (asignar `null`).
3. **De `true` a `true`** (o ya era true):
   - **No actualizar** `checkedInAt`. Mantener la fecha original del primer check-in.

## Implementación Técnica
- El controlador `team.controller.js` usará `findByPk` para obtener el estado actual antes de aplicar los cambios.
- Se realizarán actualizaciones parciales de los objetos `playerA` y `playerB` si se envían en el body.
- Las validaciones de unicidad de teléfono se mantienen.

## Criterios de Aceptación
- [x] Endpoint `PUT /api/teams/:id` implementado.
- [x] Lógica de `checked_in` (true -> sets date, false -> clears date) verificada.
- [x] Swagger actualizado con el nuevo contrato genérico.
- [x] El campo `id` permanece como UUID.
- [x] El teléfono se normaliza automáticamente al guardar (sin espacios).

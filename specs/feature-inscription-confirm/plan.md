# Especificación: Confirmación de Inscripción (Check-In)

## Objetivo
Implementar la funcionalidad en el Backend para confirmar la inscripción de una pareja precargada (hacer el "check-in") antes del inicio del torneo. Esta acción cambiará el estado de la pareja de `"preloaded"` a `"checked_in"`.

## Alcance Backend

### 1. Actualización de Swagger (`swagger.yaml`)
Se deben documentar los endpoints expuestos para la confirmación y anulación de asistencia.
- **Rutas:** 
  - `PUT /api/teams/{id}/check-in`
  - `PUT /api/teams/{id}/undo-check-in`
- **Parámetros:** `id` (UUID del equipo) en el path.
- **Respuesta (200 OK):** Objeto `TeamResponse` con su `status` actualizado (`"checked_in"` o `"preloaded"`) y el timestamp en `checkedInAt` (o `null` si se deshace).
- **Casos de error:** `404` (equipo no existe), `500` (error interno de BD).

### 2. Actualización de Rutas del Backend (`team.routes.js`)
Se añaden las rutas que enrutan la petición `PUT` hacia los métodos específicos del controlador:
```javascript
router.put('/:id/check-in', teamController.checkInTeam);
router.put('/:id/undo-check-in', teamController.undoCheckInTeam);
```

### 3. Lógica del Controlador (`team.controller.js`)
El método `checkInTeam` ejecutará:
1. Extracción del `id` desde `req.params`.
2. Búsqueda directa por clave principal: `Team.findByPk(id)`.
3. Validaciones preventivas: si no existe, devolver status HTTP `404`.
4. Mutación de estado en persistencia:
   - `team.status = 'checked_in';`
   - `team.checkedInAt = new Date();`
5. Guardado síncrono en BD con `team.save()`.
6. Retorno de la representación transformada vía el helper `mapTeamToPlayersPair`.

El método `undoCheckInTeam` ejecutará la operación inversa:
1. Extracción del `id` desde `req.params`.
2. Búsqueda directa por clave principal: `Team.findByPk(id)`.
3. Validaciones preventivas: si no existe, devolver status HTTP `404`.
4. Mutación de estado en persistencia:
   - `team.status = 'preloaded';`
   - `team.checkedInAt = null;`
5. Guardado síncrono en BD con `team.save()`.
6. Retorno de la representación transformada vía el helper `mapTeamToPlayersPair`.

## Criterios de Aceptación Técnicos
- [ ] La API expone correctamente los endpoints `PUT /api/teams/:id/check-in` y `PUT /api/teams/:id/undo-check-in`.
- [ ] El contrato OpenAPI/Swagger documenta ambos endpoints.
- [ ] Ejecutar el endpoint de anulación retorna `status: "preloaded"` y anula la fecha (`checkedInAt: null`).

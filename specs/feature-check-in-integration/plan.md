# Plan: Integración de Check-in / Tournament Start con Backend vía React Query

## Objetivo
Integrar la pantalla [frontend/app/admin/tournament-start/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/admin/tournament-start/page.tsx) con el backend real usando React Query, siguiendo exactamente la misma estrategia aplicada en la feature de precarga. La pantalla debe dejar de depender de datos mockeados para el listado y para la acción de dar/quitar presente.

## Restricción explícita
- No hacer ningún cambio en el backend.
- Toda interacción HTTP del frontend con el backend debe pasar por React Query.
- No volver a introducir estado mock como fuente principal de datos si ya existe un endpoint real.

## Contexto actual
- El frontend ya tiene instalada y configurada la infraestructura de React Query.
- La pantalla de precarga ya usa:
  - `GET /api/teams`
  - `POST /api/teams`
- La pantalla de tournament start sigue usando estado local mockeado.
- El tipo compartido del frontend para parejas es `PlayersPair`.

## Alcance funcional de esta feature
- Reemplazar la data inicial mockeada de tournament start por datos reales de backend.
- Integrar la carga de parejas mediante `GET /api/teams`.
- Integrar la acción de dar/quitar presente mediante `PUT` sobre el mismo recurso de teams.
- Mantener la UI actual de tournament start.
- Mantener los settings del torneo como estado local mientras no existan endpoints específicos para persistirlos.
- Mantener el botón `Iniciar torneo` en modo local/mock si todavía no existe endpoint real para ese paso.

## Suposición de contrato para check-in
Tomando tu indicación de que "el endpoint de dar el presente es el mismo pero un PUT", esta integración debe asumir un `PUT` sobre el recurso `teams`.

### Suposición principal
- `PUT /api/teams/:id`

### Payload esperado para dar/quitar presente
```ts
type UpdateTeamPayload = {
  playerA?: {
    name: string;
    category: number;
  };
  playerB?: {
    name: string;
    category: number;
  };
  contactPhone?: string;
  status?: "preloaded" | "checked_in";
  checkedInAt?: string | null;
};
```

## Dependencias
No hace falta instalar nuevas dependencias si la infraestructura de React Query de la feature de precarga ya está presente.

## Reuso obligatorio de infraestructura existente
Esta feature debe apoyarse en lo ya construido para la integración de precarga:
- provider global de React Query
- cliente HTTP base
- normalización de errores
- query key de `teams`
- tipado `PlayersPair`

## Diseño técnico propuesto
### 1. Reusar el recurso teams
- Extender el recurso existente en:
  - `frontend/lib/api/teams.ts`
  - `frontend/lib/queries/teams.ts`
- No crear otro recurso paralelo para check-in si los datos siguen perteneciendo a `teams`.

### 2. Nuevas operaciones a agregar
#### Query
- `useTeams()`
- Reutilizar la query ya existente para hidratar la pantalla.

#### Mutation
- Crear `useUpdateTeam()`
- Internamente debe resolver el `PUT` del recurso `teams`
- Debe servir para:
  - marcar presencia,
  - quitar presencia,
  - persistir edición de datos de la pareja si el endpoint lo soporta.

### 3. Estrategia de cache
- Reusar la query key `["teams"]`
- Después de `PUT`, invalidar `["teams"]`
- No crear un store local alternativo para reflejar el check-in

## Integración específica de tournament start
### GET
- Reemplazar el array mock generado por `createMockPreloadedPairs()`
- Tomar `pairs` desde `useTeams()`
- Usar esos datos para:
  - listado principal,
  - búsqueda,
  - contadores de presentes y pendientes

### PUT para check-in
- La acción `Dar presente` debe:
  - disparar `useUpdateTeam()`
  - enviar `status: "checked_in"`
  - enviar `checkedInAt` con timestamp actual

- La acción `Quitar presente` debe:
  - disparar `useUpdateTeam()`
  - enviar `status: "preloaded"`
  - enviar `checkedInAt: null`

### PUT para edición de pareja
Si el endpoint `PUT` también permite actualizar datos base de la pareja:
- reutilizar `useUpdateTeam()` para guardar cambios del formulario de edición
- enviar:
  - `playerA`
  - `playerB`
  - `contactPhone`
  - y, si corresponde, conservar `status` y `checkedInAt`

Si el backend no soporta todavía la edición completa con `PUT`, esta parte debe quedar fuera de alcance real y seguir marcada como pendiente.

## Qué no se integra todavía
- Persistencia de settings del torneo (`A 4 games`, `A 6 games`)
- Acción real de `Iniciar torneo`
- Cualquier endpoint nuevo fuera del recurso `teams`

Estas dos áreas deben mantenerse locales hasta que exista contrato backend explícito.

## Estados de UI a cubrir
- Loading inicial de la pantalla mientras se consulta `GET /api/teams`
- Error de carga de equipos
- Empty state real cuando no haya equipos
- Loading por mutación al dar/quitar presente
- Error por mutación de check-in
- Éxito visible después del cambio de estado
- Loading y error al guardar edición de pareja, si esa parte entra en alcance real

## Reglas de negocio del frontend
- `checked_in` en UI corresponde a `status: "checked_in"`
- pendiente corresponde a `status: "preloaded"`
- `checkedInAt` solo debe existir cuando la pareja está presente
- el cálculo de totales debe basarse en datos reales del query, no en mocks

## Secuencia de implementación sugerida
### Etapa 1: Recurso teams
- Agregar función `updateTeam`
- Agregar hook `useUpdateTeam`
- Mantener consistencia con `getTeams` y `createTeam`

### Etapa 2: Tournament start
- Reemplazar la carga mock por `useTeams`
- Reemplazar toggles locales por mutaciones `PUT`
- Conservar búsqueda y resumen sobre la data real

### Etapa 3: Ajustes de UX
- Mostrar estados de carga/error por query y mutation
- Deshabilitar botones durante mutaciones activas
- Mostrar feedback claro en acciones de check-in

### Etapa 4: Limpieza
- Remover dependencias de mocks que dejen de ser necesarias en tournament start
- Mantener solo settings e inicio del torneo como estado local temporal

## Riesgos y decisiones abiertas
- Confirmar la forma exacta del endpoint `PUT` del recurso `teams`
- Confirmar si el backend soporta edición completa o solo cambio de presencia
- Definir si el check-in y la edición deben compartir la misma mutación o si luego se separarán por intención

## Criterios de aceptación
- La pantalla `/admin/tournament-start` carga parejas reales desde `GET /api/teams`
- La acción de dar presente usa React Query y persiste por `PUT`
- La acción de quitar presente usa React Query y persiste por `PUT`
- Los contadores y el listado se actualizan desde la data real
- No hay llamadas directas al backend fuera de React Query
- No se hicieron cambios en el backend
- Los settings e inicio del torneo pueden seguir locales hasta tener endpoints propios

## Resultado esperado
La pantalla de check-in / tournament start queda conectada al backend real para lectura y cambio de presencia de parejas, reutilizando el mismo estándar de integración que la precarga y manteniendo React Query como única vía de acceso a datos.

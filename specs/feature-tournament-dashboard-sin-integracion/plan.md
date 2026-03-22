# Plan: Tournament Dashboard en Home sin Integración

## Objetivo
Convertir la home [frontend/app/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/page.tsx) en el tablero operativo del torneo para el día de juego. La pantalla debe mostrar arriba las dos canchas con el partido actualmente asignado a cada una y, debajo, el listado de próximos partidos para que el admin pueda decidir manualmente cuál mandar a cada cancha disponible.

## Restricción explícita
- No hacer ningún cambio en el backend.
- No integrar endpoints reales en esta etapa.
- Toda la data debe vivir en estado mock/local del frontend.

## Contexto actual
- La ruta `/` hoy funciona como landing general del proyecto.
- Ya existen pantallas operativas para:
  - precarga,
  - tournament start / check-in.
- La home todavía no representa el estado en vivo del torneo.

## Alcance funcional de esta feature
- Reemplazar la landing actual por un dashboard de torneo.
- Mostrar exactamente dos canchas en la parte superior.
- Cada cancha debe mostrar:
  - nombre o identificador de cancha,
  - estado actual,
  - partido asignado si existe,
  - acción para liberar la cancha cuando ese partido termine.
- Debajo de las canchas, mostrar una lista de `upcoming matches`.
- Permitir que el admin mande manualmente cualquier partido pendiente a cualquiera de las dos canchas disponibles.
- Mantener el orden visual del listado tal como venga definido en la data mock, aunque el admin pueda elegir cualquier partido para cualquier cancha.

## Qué no entra en esta etapa
- Integración con backend.
- Persistencia real del estado del torneo.
- Sincronización en tiempo real.
- Reglas automáticas de asignación de partidos.
- Cálculo real de bracket, fixture o generación de partidos.

## Ruta afectada
- [frontend/app/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/page.tsx)

## Propuesta de modelo de datos frontend
Conviene introducir tipos específicos para el dashboard, independientes de `PlayersPair`, pero compatibles conceptualmente con las parejas ya existentes.

```ts
type MatchTeam = {
  id: string;
  displayName: string;
};

type TournamentMatchStatus = "upcoming" | "on_court" | "finished";

type TournamentMatch = {
  id: string;
  order: number;
  teamA: MatchTeam;
  teamB: MatchTeam;
  roundLabel: string;
  status: TournamentMatchStatus;
  assignedCourtId: string | null;
};

type Court = {
  id: "court-1" | "court-2";
  label: string;
  currentMatchId: string | null;
};
```

## Fuente de verdad temporal
Mientras no exista integración:
- `matches` debe vivir en estado local del dashboard.
- `courts` debe vivir en estado local del dashboard.
- la asignación de un partido a una cancha debe actualizar ambos estados de forma consistente.

## Diseño funcional propuesto
### 1. Bloque superior: canchas activas
- Renderizar dos cards fijas:
  - `Cancha 1`
  - `Cancha 2`
- Si una cancha tiene partido:
  - mostrar nombres de ambas parejas,
  - mostrar ronda o etapa,
  - mostrar badge `En juego`,
  - mostrar acción `Finalizar / liberar cancha`.
- Si una cancha está vacía:
  - mostrar estado `Disponible`,
  - mostrar mensaje de espera.
- Utilizar home-refe.jpg en este mismo directorio como inspiracion para la ui. 
  - Para el diseño de la cancha 1 y cancha 2 usa /public/cancha-de-padel.jpg en vez de lo que se ve en home-refe.jpg

### 2. Bloque inferior: upcoming matches
- Mostrar listado ordenado por `order`.
- Cada item debe incluir:
  - orden del partido,
  - nombres de las parejas,
  - ronda o etapa,
  - estado.
- Cada partido pendiente debe ofrecer acciones explícitas:
  - `Mandar a Cancha 1`
  - `Mandar a Cancha 2`
- Si una cancha está ocupada:
  - la acción correspondiente debe quedar deshabilitada.
- Si un partido ya está asignado:
  - no debe seguir apareciendo como upcoming.

## Reglas de negocio del frontend
- Solo puede haber un partido activo por cancha.
- Un mismo partido no puede estar activo en dos canchas al mismo tiempo.
- Un partido `upcoming` pasa a `on_court` cuando se asigna a una cancha.
- Un partido `on_court` pasa a `finished` cuando el admin libera la cancha.
- Al finalizar un partido:
  - la cancha vuelve a estado disponible,
  - el partido deja de figurar en `upcoming matches`.
- El listado de upcoming se muestra en el orden original provisto por la data mock.
- El admin puede saltarse ese orden y asignar cualquier partido upcoming a una cancha disponible.

## UX esperada
- La parte superior debe leerse como “estado en vivo”.
- La parte inferior debe leerse como “cola operativa”.
- Debe quedar visualmente claro:
  - qué canchas están ocupadas,
  - qué canchas están libres,
  - qué partidos siguen esperando.
- El flujo principal debe requerir pocos clicks:
  - ver cancha disponible,
  - elegir partido upcoming,
  - mandarlo a una cancha.

## Estados de UI a contemplar
- Ambas canchas vacías.
- Una cancha ocupada y otra libre.
- Ambas canchas ocupadas.
- Sin upcoming matches.
- Todos los partidos finalizados.

## Arquitectura sugerida
### Opción simple para esta etapa
- Mantener todo dentro de la home con un manager client-side, por ejemplo:
  - [frontend/app/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/page.tsx)
  - [frontend/app/tournament-dashboard-manager.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/tournament-dashboard-manager.tsx)

### Helpers sugeridos
- Un archivo compartido para mocks y tipos, por ejemplo:
  - `frontend/app/shared/tournament-dashboard.ts`

## Secuencia de implementación sugerida
### Etapa 1: Tipos y mocks
- Definir tipos de `Court` y `TournamentMatch`.
- Crear mocks iniciales:
  - dos canchas vacías,
  - varios upcoming matches.

### Etapa 2: UI del dashboard
- Reemplazar la landing actual por la estructura:
  - canchas arriba,
  - upcoming matches abajo.

### Etapa 3: Lógica operativa
- Implementar asignación de partido a cancha.
- Implementar liberación/finalización de cancha.
- Derivar upcoming matches desde el estado real.

### Etapa 4: Ajustes de UX
- Deshabilitar acciones inválidas.
- Agregar badges de estado.
- Agregar empty states claros.

## Riesgos y decisiones abiertas
- Definir si al finalizar un partido debe quedar visible en una sección aparte de historial o si simplemente desaparece del tablero.
- Definir si el admin debe poder deshacer una asignación antes de finalizar el partido.
- Definir si la identificación visual del partido necesita más datos:
  - categoría,
  - instancia del cuadro,
  - horario estimado.

## Criterios de aceptación
- La home `/` muestra dos canchas en la parte superior.
- Cada cancha puede mostrar un partido activo o estado disponible.
- La home muestra debajo el listado de `upcoming matches`.
- El admin puede mandar cualquier partido upcoming a una cancha libre.
- El orden del listado upcoming se mantiene según la data base mock.
- El admin puede finalizar un partido y liberar la cancha.
- No hay integración real con backend en esta etapa.

## Resultado esperado
La home deja de ser una landing estática y pasa a funcionar como dashboard operativo del torneo, con una vista clara de las dos canchas activas y la cola de próximos partidos lista para ser administrada manualmente.

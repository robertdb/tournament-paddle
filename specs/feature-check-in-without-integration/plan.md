# Plan: Ruta de Check-in sin Integración

## Objetivo
Agregar una nueva ruta de administración para el día del torneo donde el organizador pueda confirmar la llegada de las parejas ya precargadas, configurar el formato de partidos y disparar el inicio del torneo. En esta etapa todo debe resolverse con estado mockeado de frontend, sin base de datos ni llamadas al backend.

## Alcance funcional
- Crear una nueva ruta para check-in de parejas.
- Reutilizar la misma línea visual y estructura general usada en [frontend/app/admin/precarga/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/admin/precarga/page.tsx).
- Tomar como data inicial mockeada la lista de parejas que conceptualmente proviene de la precarga.
- Permitir marcar si una pareja llegó al venue.
- Mostrar el estado de presencia de cada pareja.
- Incorporar settings del torneo en la misma pantalla.
- Incluir un botón para dar inicio al torneo.

## Propuesta de ruta
- Ruta sugerida: `/admin/tournament-start`
- Motivo:
  - Sigue la estructura administrativa ya iniciada con `/admin/precarga`.
  - Representa el paso natural posterior a la precarga.
  - Deja el flujo ordenado para futuras vistas de resultados y operación en vivo.

## Datos iniciales mockeados
La pantalla debe bootear con una lista mock de parejas que represente la salida de la precarga.

Debe reutilizar el mismo tipo base definido en la feature de precarga y sumar solo los campos propios del check-in:

```ts
type MatchFormat = "4_games" | "6_games";

type TournamentInitialSettings = {
  matchFormat: MatchFormat;
};
```

La intención es que `PlayersPair` sea el contrato único de la pareja en todo el frontend. En check-in se reutiliza ese mismo tipo y solo cambia su valor de `status` de `preloaded` a `"checked_in"`, además de completar `checkedInAt` cuando corresponda.

## Reglas de negocio
- La data inicial del check-in parte de las parejas ya precargadas.
- El organizador debe poder marcar una pareja como presente.
- El organizador debe poder desmarcar una pareja si hubo un error.
- El check-in no modifica la composición de la pareja.
- El teléfono sigue siendo a nivel pareja.
- La pantalla no genera todavía el torneo real.
- El botón de inicio solo debe operar sobre estado mockeado.
- Los settings disponibles por ahora son solamente:
  - `A 4 games`
  - `A 6 games`

## UX propuesta
### Estructura general
- Del hero/top section de la ruta de precarga, mantener solamente el botón de volver a la página anterior.
- Mantener el layout de dos columnas:
  - columna operativa con settings y resumen,
  - columna principal con el listado de parejas.

### Panel lateral o superior de control
- Resumen de estado:
  - total de parejas,
  - cantidad presentes,
  - cantidad pendientes.
- Bloque de settings del torneo.
- Botón principal `Iniciar torneo`.

### Listado de parejas
- Mostrar por cada pareja:
  - ambos nombres,
  - categorías,
  - teléfono,
  - estado actual: `Pendiente` o `Presente`. Tené en cuenta que pendiente es `preloaded`.
- Acción principal:
  - `Dar presente` cuando aún no llegó.
  - `Quitar presente` si ya fue confirmada.
- Búsqueda simple por nombre o teléfono.

## Settings del torneo
El bloque de configuración debe permitir visualizar y editar el formato de partido.

### Partidos
- Opción `A 4 games`
- Opción `A 6 games`

### Comportamiento esperado
- Debe existir siempre una única opción seleccionada.
- El cambio de setting impacta solo sobre el estado mock actual.
- El setting seleccionado debe quedar visible antes de iniciar el torneo.

## Botón de inicio del torneo
El botón `Iniciar torneo` debe existir desde esta etapa, aunque su efecto sea mockeado.

### Comportamiento mock sugerido
- Validar que haya al menos una pareja marcada como presente.
- Validar que exista un formato de partidos seleccionado.
- Si falta algo, mostrar mensaje claro en UI.
- Si todo está correcto, mostrar feedback visual de “torneo listo para iniciar” o “inicio mock ejecutado”.

## Estrategia técnica por etapas
### Etapa 1: Ruta y composición visual
- Crear la ruta `/tournament-start`.
- Reusar el estilo general de la página de precarga (quitar el hero como dijimos arriba).
- Definir un nuevo componente cliente para manejar el estado del check-in.

### Etapa 2: Estado mock
- Crear un arreglo inicial mockeado de parejas.
- Implementar toggles para `checked_in`.
- Implementar búsqueda y filtrado.
- Mostrar contadores derivados de presentes y pendientes.

### Etapa 3: Settings e inicio mock
- Agregar selector de formato de partidos.
- Persistir el setting en estado local del componente.
- Agregar botón `Iniciar torneo`.
- Implementar validaciones mínimas y mensajes de feedback.

## Validaciones recomendadas
- No permitir iniciar torneo sin formato seleccionado.
- No permitir iniciar torneo si no hay parejas presentes.
- El check-in debe ser reversible.
- La búsqueda no debe alterar los datos, solo el listado visible.

## Estados y mensajes
- Estado vacío:
  - mensaje indicando que no hay parejas precargadas para check-in.
- Estado pendiente:
  - badge o etiqueta visible para las parejas no confirmadas.
- Estado presente:
  - badge o etiqueta visible para las parejas confirmadas.
- Error de inicio:
  - mensaje general si faltan presentes o configuración.
- Inicio mock exitoso:
  - feedback visible sin navegación ni integración real.

## Consideraciones de diseño
- Debe verse consistente con la ruta de precarga.
- Debe poder operarse rápido desde móvil.
- La acción de `Dar presente` tiene que ser inmediata y muy visible.
- El bloque de settings no debe competir visualmente con el listado de parejas.

## Criterios de aceptación
- Existe una ruta nueva para el check-in.
- La UI mantiene la misma línea visual de la ruta de precarga.
- La pantalla arranca con parejas mockeadas provenientes conceptualmente de precarga.
- Cada pareja puede marcarse como presente.
- Cada pareja puede volver a estado pendiente.
- Se muestran los settings del torneo en la misma pantalla.
- El formato de partidos puede elegirse entre `A 4 games` y `A 6 games`.
- Existe un botón `Iniciar torneo`.
- El inicio del torneo funciona de forma mockeada, sin integración.
- El check-in permitirá editar datos de la pareja además de confirmar presencia


## Resultado esperado
El organizador cuenta con una pantalla operativa para el día del torneo donde puede confirmar asistencia de parejas ya cargadas, definir el formato de partidos y dejar el torneo listo para el siguiente paso, todo con estado local de frontend y sin dependencias externas.

## Restricción explícita
No integrar base de datos, servicios externos ni llamadas al backend. Toda la feature debe pensarse y luego implementarse con datos mockeados del frontend.

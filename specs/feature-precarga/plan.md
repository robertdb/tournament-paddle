# Plan: Ruta de Precarga de Parejas

## Objetivo
Agregar una ruta de administración previa a la inicialización del torneo para cargar las parejas participantes. Esta pantalla resuelve la etapa de pre-carga mencionada en `DEFINITION.md`: registrar jugadores antes del check-in y antes de la generación efectiva del torneo.

## Alcance funcional
- Crear una nueva ruta de frontend para la precarga de parejas.
- Permitir alta manual de parejas del torneo.
- Cada pareja tendrá:
  - Jugador A: nombre, categoría.
  - Jugador B: nombre, categoría.
  - Teléfono de contacto de la pareja.
- La categoría de cada jugador será un número entero entre 1 y 9.
- El teléfono será único por pareja, no por jugador.
- La pantalla debe servir como paso previo al check-in y a la generación del torneo.

## Propuesta de ruta
- Ruta sugerida: `/admin/precarga`
- Motivo:
  - Es una funcionalidad operativa del organizador.
  - Mantiene separada la carga inicial de la futura vista pública.
  - Deja espacio para luego incorporar `/admin/check-in`, `/admin/resultados` y otras vistas internas.

## Modelo de datos inicial
Se propone unificar el dominio en un tipo base compartido para todo el flujo:

```ts
type PlayerCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type PlayersPairStatus = "preloaded" | "checked_in";

type Player = {
  name: string;
  category: PlayerCategory;
};

type PlayersPair = {
  id: string;
  contactPhone: string;
  playerA: Player;
  playerB: Player;
  status: PlayersPairStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

`PlayersPair` debe ser el tipo canónico compartido entre features. En la etapa de precarga se usa con `status: "preloaded"` y `checkedInAt: null`.

## Reglas de negocio
- Debe haber exactamente 2 jugadores por pareja.
- Ambos nombres son obligatorios.
- La categoría de cada jugador es obligatoria y debe estar entre 1 y 9.
- El teléfono es obligatorio a nivel pareja.
- Se debe impedir guardar parejas con datos incompletos.
- Se debe evitar duplicar parejas por error.
- Validación mínima recomendada para duplicados:
  - mismo teléfono, o
  - mismos dos nombres normalizados.
- La precarga no implica check-in.
- La precarga no genera grupos ni cuadro.
- La pareja precargada queda disponible para el flujo posterior de reconfirmación.
- El shape compartido de pareja debe mantenerse compatible con check-in y etapas posteriores.

## UX propuesta
### Vista principal
- Título claro: "Precarga de parejas".
- Subtítulo breve explicando que esta pantalla carga participantes antes del inicio del torneo.
- Formulario principal para alta de una pareja.
- Listado inferior con parejas ya cargadas.

### Formulario
- Campo `Nombre jugador 1`.
- Campo `Categoría jugador 1` con selector de 1 a 9.
- Campo `Nombre jugador 2`.
- Campo `Categoría jugador 2` con selector de 1 a 9.
- Campo `Teléfono de contacto`.
- Botón `Agregar pareja`.

### Listado de parejas cargadas
- Mostrar:
  - nombres de ambos jugadores,
  - categorías,
  - teléfono,
  - nivel promedio calculado de la pareja.
- Acciones recomendadas:
  - editar,
  - eliminar (con confirmación)
  - búsqueda simple por nombre o teléfono.

## Cálculos derivados
No muestres nada

## Estrategia técnica por etapas
### Etapa 1: UI local
- Crear la ruta `/admin/precarga`.
- Implementar el formulario y el listado con estado local o mock.
- Incluir validaciones de cliente.
- Permitir agregar y borrar parejas en memoria.

## Estados y mensajes
- Estado vacío:
  - mensaje indicando que todavía no hay parejas cargadas.
- Error de validación:
  - mensajes inline por campo.
- Guardado exitoso:
  - feedback corto y visible.
- Error de persistencia:
  - mensaje general y preservación de los datos cargados en el formulario.

## Consideraciones de diseño
- Debe ser mobile-friendly porque probablemente el organizador la use desde el teléfono.
- Debe priorizar velocidad de carga y edición.
- La interfaz tiene que minimizar taps y escritura repetitiva.
- Conviene que el formulario quede siempre visible por encima del listado.

## Riesgos y decisiones abiertas
- Definir si una pareja puede cargarse varias veces con diferente teléfono.
- Definir si la categoría representa nivel exacto o auto-percibido.
- Definir si se necesita importación masiva futura desde WhatsApp, CSV o planilla.

## Criterios de aceptación
- Existe una ruta accesible para precargar parejas antes del torneo.
- Se puede crear una pareja con 2 jugadores y 1 teléfono.
- No se puede guardar una pareja con nombres vacíos.
- No se puede guardar una categoría fuera del rango 1-9.
- El teléfono se registra a nivel pareja.
- La lista muestra las parejas ya cargadas.
- La pantalla deja preparada la transición al futuro check-in.

## Resultado esperado
El organizador cuenta con una pantalla previa al evento para registrar ordenadamente las parejas del torneo, reduciendo fricción el día de juego y dejando los datos listos para check-in, balanceo de grupos y generación posterior del cuadro.

IMPORTANTE: No hacer ninguna integración con ningún servicio. Solo estados mockeados del FE.

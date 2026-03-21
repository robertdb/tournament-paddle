# Plan: Integración de Precarga con Backend vía React Query

## Objetivo
Integrar la pantalla de precarga [frontend/app/admin/precarga/page.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/admin/precarga/page.tsx) con el backend real usando `@tanstack/react-query`, de forma que todas las interacciones HTTP del frontend pasen por React Query. En esta primera etapa el alcance real de integración queda limitado a `GET /api/teams` y `POST /api/teams`, sin hacer cambios en el backend.

## Restricción explícita
- No hacer ningún cambio en el backend.
- Toda integración con backend debe canalizarse a través de React Query.
- Aunque en esta etapa solo existan `GET` y `POST`, la arquitectura del frontend debe quedar preparada para futuros `PUT`, `PATCH`, `DELETE` y demás mutaciones también vía React Query.

## Estado actual
- El frontend no tiene `react-query` instalado.
- La pantalla de precarga usa estado local en memoria para listar y crear parejas.
- El backend hoy expone en `/api/teams`:
  - `GET /api/teams`
  - `POST /api/teams`
- La estructura de datos del frontend ya está alineada con el shape que devuelve el backend mediante `PlayersPair`.

## Alcance funcional de esta feature
- Instalar React Query en el frontend.
- Configurar `QueryClientProvider` a nivel app.
- Crear una capa de cliente HTTP del frontend para el backend.
- Crear hooks de React Query para el recurso `teams`.
- Reemplazar el estado mock local de la pantalla de precarga por:
  - `useQuery` para listar parejas desde `GET /api/teams`
  - `useMutation` para crear parejas con `POST /api/teams`
- Mantener la UI actual de la pantalla de precarga.
- Agregar estados de carga, error y éxito acordes a la integración.
- Crear .env para el frontend que pueda leer el baseUrl de la api

## Dependencias
- Instalar `@tanstack/react-query`
- Instalar `@tanstack/react-query-devtools` solo para desarrollo
  
## Diseño técnico propuesto
### 1. Provider global
- Crear un provider cliente para React Query, por ejemplo:
  - `frontend/app/providers.tsx`
- Montarlo desde [frontend/app/layout.tsx](/Users/121455/Marc/dev/tournament-paddle/frontend/app/layout.tsx).
- Definir una única instancia de `QueryClient` para toda la app.

### 2. Cliente HTTP base
- Crear una capa simple de acceso HTTP, por ejemplo:
  - `frontend/lib/api/client.ts`
- Responsabilidades:
  - resolver `baseURL` del backend,
  - centralizar `fetch`,
  - parsear JSON,
  - normalizar errores del backend.

### 3. Configuración de base URL
- No hardcodear la URL del backend en componentes.
- Usar una variable pública de entorno, por ejemplo:
  - `NEXT_PUBLIC_API_BASE_URL`
- Definir fallback razonable solo para desarrollo si hace falta.

### 4. Hooks por recurso
- Crear hooks dedicados al recurso `teams`, por ejemplo:
  - `frontend/lib/api/teams.ts`
  - `frontend/lib/queries/teams.ts`
- Separar:
  - funciones puras de request,
  - hooks de React Query.

## Contrato inicial del recurso teams
### Query
- `useTeams()`
- Internamente usa `GET /api/teams`
- Devuelve `PlayersPair[]`

### Mutation
- `useCreateTeamMutation()`
- Internamente usa `POST /api/teams`
- Input adaptado desde el formulario actual:

```ts
type PlayersPairPayload = {
  playerA: {
    name: string;
    category: number;
  };
  playerB: {
    name: string;
    category: number;
  };
  contactPhone: string;
};
```
## Integración específica de la pantalla de precarga
### GET
- Reemplazar el estado local `pairs` como fuente principal por `useTeams`.
- Usar el resultado del query para:
  - renderizar el listado,
  - filtrar por nombre o teléfono,
  - calcular cantidad de parejas.

### POST
- Al enviar el formulario en modo alta:
  - validar en cliente como hoy,
  - disparar `useCreateTeam`,
  - invalidar o actualizar la query `teams`,
  - resetear el formulario si el alta fue exitosa,
  - mostrar feedback visible.

### Edición y borrado
- Como el backend actual no expone `PUT/PATCH/DELETE` para `teams`, esta feature no debe inventar persistencia que no existe.
- Opciones recomendadas:
  - mantener esas acciones fuera de alcance y deshabilitarlas visualmente, o
  - ocultarlas temporalmente en la pantalla integrada.

La recomendación más consistente es no ofrecer edición/borrado persistente hasta que existan endpoints reales.
No implementes esto

## Estados de UI a cubrir
- Loading inicial del listado.
- Error de carga del listado.
- Empty state real cuando `GET /api/teams` devuelve vacío.
- Estado de envío del formulario durante `POST`.
- Error de creación con mensaje del backend si existe.
- Éxito de creación y refresco del listado.

## Estrategia de cache
- Definir una query key estable, por ejemplo:
  - `["teams"]`
- Después de `POST`, invalidar `["teams"]` o actualizar el cache con la respuesta creada.
- En esta primera etapa, invalidar `["teams"]` es suficiente y más simple.

## Manejo de errores
- Si el backend responde `400`, mostrar el mensaje de negocio devuelto por la API.
- Si responde `500` o falla la red, mostrar un mensaje genérico y accionable.
- Centralizar la lectura del error en la capa HTTP o en un helper reutilizable.

## Tipados
- Reusar `PlayersPair` como tipo de lectura principal.
- Mantener separados:
  - el tipo de formulario (`PairFormState`),
  - el payload del request (`CreateTeamPayload`),
  - el tipo de respuesta (`PlayersPair`).

## Secuencia de implementación sugerida
### Etapa 1: Infraestructura
- Instalar `@tanstack/react-query`.
- Crear provider global.
- Crear cliente HTTP base.
- Crear query keys compartidas.

### Etapa 2: Recurso teams
- Implementar request `getTeams`.
- Implementar request `createTeam`.
- Implementar `useTeams`.
- Implementar `useCreateTeam`.

### Etapa 3: Pantalla de precarga
- Reemplazar el listado mock por `useTeams`.
- Reemplazar el alta local por `useCreateTeam`.
- Mantener validaciones del formulario actuales.
- Ajustar feedbacks y estados de carga/error.

### Etapa 4: Limpieza
- Remover dependencias de estado mock que dejen de ser necesarias en precarga.
- Dejar documentado que futuras integraciones de escritura siguen la misma convención de React Query.

## Riesgos y decisiones abiertas
- Definir la URL base del backend para desarrollo local y otros entornos.
- Decidir si edición/borrado deben ocultarse o mostrarse como no disponibles.
- Confirmar si el frontend y el backend correrán en puertos distintos de forma estable.

## Criterios de aceptación
- `@tanstack/react-query` está instalado y configurado globalmente.
- La pantalla de precarga obtiene datos desde `GET /api/teams`.
- La pantalla de precarga crea parejas vía `POST /api/teams`.
- El listado se actualiza luego del alta exitosa.
- Los errores del backend se muestran de manera usable.
- No hay llamadas directas al backend fuera de React Query.
- No se hizo ningún cambio en el backend.

## Resultado esperado
La pantalla de precarga deja de depender de estado mock para lectura y alta de parejas, y pasa a integrarse con el backend real usando React Query como estándar obligatorio para acceso a datos en el frontend.

# Plan de Implementación Backend: MVP Escalonado con Validaciones

Este plan detalla los pasos exactos que seguiremos. Al finalizar cada paso, me detendré y te haré las preguntas indicadas en la sección **"Validación con el usuario"** para asegurar que estamos alineados antes de escribir el código del siguiente paso.

---

## Paso 1: Setup Base y Contrato de API (Swagger)

**Objetivos del paso:**
- Inicializar el proyecto Node.js con Express.
- Instalar dependencias esenciales (Express, Cors, Multer, Swagger UI).
- Crear un archivo `swagger.yaml` documentando un endpoint de prueba: `POST /api/teams/upload`.
- Levantar el servidor y mostrar el Swagger funcionando.

**Validación con el usuario (Preguntas que te haré al terminar este paso):**
1. ¿El archivo a subir será un CSV, un Excel (.xlsx) o un JSON?
2. ¿Cuáles son las columnas/datos exactos que enviará ese archivo (ej: Nombre Jugador 1, Nombre Jugador 2, Nivel Promedio, Teléfono)?
3. ¿Quieres que la API devuelva un resumen de lo que leyó del archivo antes de guardarlo, o que lo guarde directamente?

---

## Paso 2: Modelo de Datos y ORM (PostgreSQL + Sequelize)

**Objetivos del paso:**
*Solo avanzaremos aquí tras aprobar el Paso 1.*
- Configurar la conexión a la base de datos PostgreSQL usando Sequelize.
- Crear el modelo `Team` (`team.model.js`) basándonos en los campos confirmados en el Paso 1.
- Crear el script/lógica real que toma el archivo subido usando Multer, lo parsea y guarda cada registro en la base de datos usando el ORM.

**Validación con el usuario (Preguntas que te haré al terminar este paso):**
1. ¿Vamos a permitir que se suba el archivo varias veces pisando los datos anteriores, o cada carga suma equipos nuevos?
2. ¿Hay algún dato adicional (ej: validación de nivel máximo/mínimo) que deba fallar si el archivo viene mal armado?

---

## Paso 3: Endpoints de Consulta y Check-in

**Objetivos del paso:**
*Solo avanzaremos aquí tras aprobar el Paso 2.*
- Crear endpoint `GET /api/teams` para listar los equipos cargados.
- Crear endpoint `PATCH /api/teams/:id/check-in` para que el admin confirme qué equipos llegaron el día del torneo.

**Validación con el usuario (Preguntas que te haré al terminar este paso):**
1. Para listar los equipos, ¿necesitas filtrarlos por estado (confirmados vs no confirmados) o enviamos todos juntos en el mismo listado?
2. Una vez que confirmamos los check-ins, ¿el diseño del endpoint temporal cumple las expectativas para pasar a la siguiente fase (Generación de Grupos y Cuadros)?

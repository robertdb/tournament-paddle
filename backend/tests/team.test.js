const request = require('supertest');
const app = require('../server');
const { Team, sequelize } = require('../src/models');

describe('API de Equipos - Normalización y Unicidad', () => {
  beforeAll(async () => {
    // Limpiamos la base antes de los tests para tener un entorno limpio
    // Usamos force: true para resetear la tabla si es necesario, 
    // pero con destroy es más seguro para no borrar el esquema.
    await Team.destroy({ where: {}, cascade: true, truncate: true });
  });

  afterAll(async () => {
    // Cerramos la conexión a la DB para que Jest termine correctamente
    await sequelize.close();
  });

  test('POST /api/teams - Debería normalizar el teléfono eliminando espacios y caracteres no numéricos', async () => {
    const response = await request(app)
      .post('/api/teams')
      .send({
        playerA: { name: 'Juan Perez', category: 5 },
        playerB: { name: 'Martin Lopez', category: 4 },
        contactPhone: '11 5555 1001' // Enviado con espacios
      });

    expect(response.status).toBe(201);
    expect(response.body.contactPhone).toBe('1155551001'); // Debe estar normalizado
    expect(response.body.checked_in).toBe(false); // Validamos que el check_in sea false por defecto
    expect(response.body.checkedInAt).toBe(null); // Validamos que no tenga fecha de check-in al inicio
    expect(response.body.playerA.name).toBe('Juan Perez');


  });

  test('POST /api/teams - No debería permitir crear un equipo con un teléfono que, al normalizarse, sea idéntico a uno existente', async () => {
    // Intentamos crear otro equipo con el mismo número pero con distinto formato
    const response = await request(app)
      .post('/api/teams')
      .send({
        playerA: { name: 'Beto Gomez', category: 2 },
        playerB: { name: 'Luis Garcia', category: 3 },
        contactPhone: '11 5555-1001' // Mismo número pero con guión
      });


    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El teléfono ya está registrado para otro equipo.');
  });

  test('PUT /api/teams/:id - Debería actualizar nombre y categoría de los jugadores', async () => {
    const teams = await Team.findAll();
    const teamId = teams[0].id;

    const response = await request(app)
      .put(`/api/teams/${teamId}`)
      .send({
        playerA: { name: 'Braian Admin', category: 9 },
        playerB: { name: 'Antigravity AI', category: 1 }
      });

    expect(response.status).toBe(200);
    expect(response.body.playerA.name).toBe('Braian Admin');
    expect(response.body.playerA.category).toBe(9);
    expect(response.body.playerB.name).toBe('Antigravity AI');
  });

  test('PUT /api/teams/:id - Debería realizar el Check-In correctamente (false -> true)', async () => {
    const teams = await Team.findAll();
    const teamId = teams[0].id;

    const response = await request(app)
      .put(`/api/teams/${teamId}`)
      .send({ checked_in: true });

    expect(response.status).toBe(200);
    expect(response.body.checked_in).toBe(true);
    expect(response.body.status).toBe('checked_in');
    expect(response.body.checkedInAt).not.toBeNull();
  });

  test('PUT /api/teams/:id - No debería cambiar la fecha original si ya estaba en checked_in: true', async () => {
    const teams = await Team.findAll();
    const teamId = teams[0].id;
    const initialDate = teams[0].checkedInAt;

    // Esperamos un momento para asegurar que si se actualizara, la fecha cambiaría
    await new Promise(resolve => setTimeout(resolve, 100));

    const response = await request(app)
      .put(`/api/teams/${teamId}`)
      .send({ checked_in: true }); // Enviamos true de nuevo

    const updatedDate = new Date(response.body.checkedInAt);
    expect(updatedDate.getTime()).toBe(initialDate.getTime());
  });

  test('PUT /api/teams/:id - Debería limpiar la fecha de Check-In (true -> false)', async () => {
    const teams = await Team.findAll();
    const teamId = teams[0].id;

    const response = await request(app)
      .put(`/api/teams/${teamId}`)
      .send({ checked_in: false });

    expect(response.status).toBe(200);
    expect(response.body.checked_in).toBe(false);
    expect(response.body.status).toBe('preloaded');
    expect(response.body.checkedInAt).toBeNull();
  });
});


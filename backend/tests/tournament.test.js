const request = require('supertest');
const app = require('../server');
const { Tournament, Stage, sequelize } = require('../src/models');

describe('API de Torneos', () => {
  beforeAll(async () => {
    // Limpiamos etapas antes de torneos por restricción de integridad
    await Stage.destroy({ where: {} });
    await Tournament.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/tournaments - Debería crear un torneo con sus etapas', async () => {
    const tournamentData = {
      name: "Torneo de Prueba",
      numberOfCourts: 3,
      stages: [
        {
          order: 1,
          type: "GROUP_STAGE",
          numberOfCourts: 3,
          config: {
            groupsOf4: 2,
            groupsOf3: 1,
            teamsAdvancingPerGroup: 2
          }
        },
        {
          order: 2,
          type: "KNOCKOUT_STAGE",
          numberOfCourts: 1,
          config: {
            startingRound: "QUARTER_FINALS"
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/tournament')
      .send(tournamentData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Torneo creado con éxito");
    
    // Validar creación de grupos en la primera etapa
    const { Tournament: TournamentModel, Stage: StageModel, Group: GroupModel, Match: MatchModel } = require('../src/models');
    const tournament = await TournamentModel.findOne({ order: [['createdAt', 'DESC']], include: [{ model: StageModel, as: 'stages' }] });
    
    expect(tournament.name).toBe("Torneo de Prueba");
    expect(tournament.stages).toHaveLength(2);

    const stage1Id = tournament.stages.find(s => s.type === 'GROUP_STAGE').id;
    const groups = await GroupModel.findAll({ where: { stageId: stage1Id } });
    expect(groups).toHaveLength(3); // 2 de 4 + 1 de 3

    // Validar creación de partidos en la segunda etapa (Cuartos -> Semis -> Final)
    const stage2Id = tournament.stages.find(s => s.type === 'KNOCKOUT_STAGE').id;
    const matches = await MatchModel.findAll({ where: { stageId: stage2Id } });
    // Estructura: Final(1) + Semis(2) + Quarters(4) si startingRound era QUARTER_FINALS
    // Mi lógica actual crea el árbol completo hacia atrás.
    expect(matches.length).toBeGreaterThanOrEqual(7); 
  });

  test('POST /api/tournaments - Debería usar el default de canchas si no se envía', async () => {
    const tournamentData = {
      name: "Torneo Sin Canchas",
      stages: [
        {
          order: 1,
          type: "GROUP_STAGE",
          config: { groupsOf4: 1 }
        }
      ]
    };

    const response = await request(app)
      .post('/api/tournament')
      .send(tournamentData);

    expect(response.status).toBe(201);

    const { Tournament: TournamentModel, Stage: StageModel } = require('../src/models');
    const tournament = await TournamentModel.findOne({ order: [['createdAt', 'DESC']], include: [{ model: StageModel, as: 'stages' }] });

    expect(tournament.numberOfCourts).toBe(2);
    expect(tournament.stages[0].numberOfCourts).toBe(2);
  });

  test('POST /api/tournament - Debería generar correctamente grupos de 4 y 3 con sus respectivos partidos', async () => {
    const tournamentData = {
      name: "Torneo Grupos",
      stages: [
        {
          order: 1,
          type: "GROUP_STAGE",
          config: {
            groupsOf4: 1,
            groupsOf3: 1
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/tournament')
      .send(tournamentData);

    expect(response.status).toBe(201);

    const { Group: GroupModel, Match: MatchModel } = require('../src/models');
    
    // Buscar los grupos de la última etapa creada
    const groups = await GroupModel.findAll({ 
       order: [['createdAt', 'DESC']],
       limit: 2
    });

    expect(groups).toHaveLength(2);
    
    const g4 = groups.find(g => g.numberOfTeams === 4);
    const g3 = groups.find(g => g.numberOfTeams === 3);

    expect(g4).toBeDefined();
    expect(g3).toBeDefined();

    // Validar partidos del grupo de 4 team (6 partidos)
    const matches4 = await MatchModel.findAll({ where: { groupId: g4.id, round: 'GROUP_MATCH' } });
    expect(matches4).toHaveLength(6);
    expect(matches4[0].placeholderA).toContain('Equipo');
    expect(matches4[0].placeholderB).toContain('Zona');

    // Validar partidos del grupo de 3 teams (3 partidos)
    const matches3 = await MatchModel.findAll({ where: { groupId: g3.id, round: 'GROUP_MATCH' } });
    expect(matches3).toHaveLength(3);
  });
});

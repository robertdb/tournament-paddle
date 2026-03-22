const { Team, Tournament, Stage, Group, Match, sequelize } = require('../src/models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (force: true)');

    // 1. Crear Torneo
    const tournament = await Tournament.create({ name: 'Torneo 7 Equipos', numberOfCourts: 2 });
    
    // 2. Crear Etapa de Grupos (2 Zonas: una de 4 y otra de 3 = 7 equipos)
    const stage = await Stage.create({
      tournamentId: tournament.id,
      order: 1,
      type: 'GROUP_STAGE',
      config: { groupsOf4: 1, groupsOf3: 1, teamsAdvancingPerGroup: 2 }
    });

    const g1 = await Group.create({ stageId: stage.id, name: 'Zona 1', numberOfTeams: 4 });
    const g2 = await Group.create({ stageId: stage.id, name: 'Zona 2', numberOfTeams: 3 });

    // 3. Crear 7 Equipos y asignarlos
    const teamsData = [
      { playerA_name: 'Juan Perez', playerA_category: 5, playerB_name: 'Martin Lopez', playerB_category: 5, contactPhone: '11111111', groupId: g1.id },
      { playerA_name: 'Beto Gomez', playerA_category: 5, playerB_name: 'Luis Garcia', playerB_category: 4, contactPhone: '22222222', groupId: g1.id },
      { playerA_name: 'Carlos Rey', playerA_category: 6, playerB_name: 'Pedro Paz', playerB_category: 6, contactPhone: '33333333', groupId: g1.id },
      { playerA_name: 'Diego Sol', playerA_category: 4, playerB_name: 'Enzo Mar', playerB_category: 5, contactPhone: '44444444', groupId: g1.id },
      { playerA_name: 'Fede Cruz', playerA_category: 7, playerB_name: 'Gabi Luz', playerB_category: 7, contactPhone: '55555555', groupId: g2.id },
      { playerA_name: 'Hugo Juez', playerA_category: 5, playerB_name: 'Ivan Flor', playerB_category: 5, contactPhone: '66666666', groupId: g2.id },
      { playerA_name: 'Keko Van', playerA_category: 6, playerB_name: 'Leo Mar', playerB_category: 6, contactPhone: '77777777', groupId: g2.id }
    ];

    for (const data of teamsData) {
      await Team.create(data);
    }
    console.log('7 Teams created and assigned to groups.');

    // 4. Crear Partidos Round Robin para las zonas
    const createMatches = async (groupId, numTeams, groupName) => {
        const teamIds = (await Team.findAll({ where: { groupId } })).map(t => t.id);
        const placeholders = [];
        if (numTeams === 3) {
            placeholders.push([0, 1], [1, 2], [0, 2]);
        } else if (numTeams === 4) {
            placeholders.push([0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]);
        }

        for (const [idxA, idxB] of placeholders) {
            await Match.create({
                stageId: stage.id,
                groupId: groupId,
                round: 'GROUP_MATCH',
                teamA_id: teamIds[idxA],
                teamB_id: teamIds[idxB],
                status: 'pending'
            });
        }
    };

    await createMatches(g1.id, 4, 'Zona 1');
    await createMatches(g2.id, 3, 'Zona 2');
    console.log('Group matches generated.');

    // 5. Crear Etapa Eliminatoria (Semis directas)
    const stageK = await Stage.create({
        tournamentId: tournament.id,
        order: 2,
        type: 'KNOCKOUT_STAGE',
        config: { startingRound: 'SEMIFINALS' }
    });

    const final = await Match.create({
        stageId: stageK.id,
        round: 'FINALS',
        placeholderA: 'Ganador Semi 1',
        placeholderB: 'Ganador Semi 2',
        status: 'pending'
    });

    await Match.create({
        stageId: stageK.id,
        round: 'SEMIFINALS',
        placeholderA: '1ro Zona 1',
        placeholderB: '2do Zona 2',
        advancesToMatchId: final.id,
        status: 'pending'
    });

    await Match.create({
        stageId: stageK.id,
        round: 'SEMIFINALS',
        placeholderA: '1ro Zona 2',
        placeholderB: '2do Zona 1',
        advancesToMatchId: final.id,
        status: 'pending'
    });

    console.log('Knockout stage and matches generated.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

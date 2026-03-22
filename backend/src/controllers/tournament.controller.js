const { Tournament, Stage, Group, Match, Team, sequelize } = require('../models');

/**
 * Crea un nuevo torneo estructurando automáticamente sus fases y partidos placeholders.
 */
exports.createTournament = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, numberOfCourts, stages } = req.body;

    // 1. Crear el torneo
    const tournament = await Tournament.create({
      name,
      numberOfCourts: numberOfCourts || 2
    }, { transaction });

    // 2. Crear las etapas (Stages)
    if (stages && Array.isArray(stages)) {
      for (const stageData of stages) {
        const stage = await Stage.create({
          tournamentId: tournament.id,
          order: stageData.order,
          type: stageData.type,
          numberOfCourts: stageData.numberOfCourts || tournament.numberOfCourts,
          config: stageData.config
        }, { transaction });
        
        // 3. Lógica Estructural (Zonas/Brackets)
        if (stage.type === 'GROUP_STAGE') {
          const { groupsOf4 = 0, groupsOf3 = 0 } = stage.config;
          let groupCount = 1;

          // Traer los últimos equipos checked_in para asignarlos a los grupos
          const teamsToAssign = await Team.findAll({
            where: { checked_in: true },
            order: [['createdAt', 'DESC']],
            transaction
          });
          let teamIndex = 0;

          const createGroupMatches = async (groupId, numTeams, groupName, groupTeams) => {
             // Round Robin simplificado
             const matches = [];
             if (numTeams === 3) {
                matches.push({ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 1, b: 3 });
             } else if (numTeams === 4) {
                matches.push({ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 1, b: 3 }, { a: 2, b: 4 }, { a: 1, b: 4 }, { a: 2, b: 3 });
             }
             for (const m of matches) {
                const tA = groupTeams[m.a - 1];
                const tB = groupTeams[m.b - 1];

                await Match.create({
                  stageId: stage.id,
                  groupId: groupId,
                  round: 'GROUP_MATCH',
                  placeholderA: tA ? `${tA.playerA_name} & ${tA.playerB_name}` : `Equipo ${m.a} - ${groupName}`,
                  placeholderB: tB ? `${tB.playerA_name} & ${tB.playerB_name}` : `Equipo ${m.b} - ${groupName}`,
                  teamA_id: tA ? tA.id : null,
                  teamB_id: tB ? tB.id : null,
                  status: 'pending'
                }, { transaction });
             }
          };

          const assignTeamsToGroup = async (group, numTeams) => {
             const groupTeams = [];
             for (let t = 0; t < numTeams; t++) {
               if (teamIndex < teamsToAssign.length) {
                 const team = teamsToAssign[teamIndex++];
                 team.groupId = group.id;
                 await team.save({ transaction });
                 groupTeams.push(team);
               }
             }
             return groupTeams;
          };

          // Crear grupos de 4
          for (let i = 0; i < groupsOf4; i++) {
            const groupName = `Zona ${groupCount++}`;
            const group = await Group.create({
              stageId: stage.id,
              name: groupName,
              numberOfTeams: 4
            }, { transaction });
            const groupTeams = await assignTeamsToGroup(group, 4);
            await createGroupMatches(group.id, 4, groupName, groupTeams);
          }

          // Crear grupos de 3
          for (let i = 0; i < groupsOf3; i++) {
            const groupName = `Zona ${groupCount++}`;
            const group = await Group.create({
              stageId: stage.id,
              name: groupName,
              numberOfTeams: 3
            }, { transaction });
            const groupTeams = await assignTeamsToGroup(group, 3);
            await createGroupMatches(group.id, 3, groupName, groupTeams);
          }
        } 
        else if (stage.type === 'KNOCKOUT_STAGE') {
          const { startingRound } = stage.config;
          
          const roundsOrder = ['FINALS', 'SEMIFINALS', 'QUARTER_FINALS', 'ROUND_OF_16', 'ROUND_OF_32'];
          const startIndex = roundsOrder.indexOf(startingRound);
          
          if (startIndex !== -1) {
            // Creamos las rondas desde la final hacia atrás para linkear advancesToMatchId
            let previousRoundMatches = [];
            
            for (let i = 0; i <= startIndex; i++) {
              const currentRoundName = roundsOrder[i];
              const matchesInRound = Math.pow(2, i);
              const currentRoundMatches = [];

              for (let j = 0; j < matchesInRound; j++) {
                // Si es la final, no tiene a dondé avanzar
                // Si no, avanza al partido correspondiente de la ronda "anterior" (i-1)
                const advancesTo = i === 0 ? null : previousRoundMatches[Math.floor(j / 2)].id;
                
                let placeholderA = '';
                let placeholderB = '';

                if (currentRoundName === startingRound) {
                  // Etiquetas para la ronda inicial basadas en clasificados
                  // Ej: "1ro Zona 1", "2do Zona 2"
                  // Nota: Esto es una simplificación, en un sistema real se calcularía según número de grupos
                  placeholderA = `${Math.floor(j * 2) % 2 === 0 ? '1ro' : '2do'} Zona ${j + 1}`;
                  placeholderB = `${Math.floor(j * 2 + 1) % 2 === 0 ? '1ro' : '2do'} Zona ${j + 2}`;
                } else {
                  placeholderA = `Ganador ${roundsOrder[i+1]} ${j * 2 + 1}`;
                  placeholderB = `Ganador ${roundsOrder[i+1]} ${j * 2 + 2}`;
                }

                const match = await Match.create({
                  stageId: stage.id,
                  round: currentRoundName,
                  status: 'pending',
                  advancesToMatchId: advancesTo,
                  placeholderA,
                  placeholderB
                }, { transaction });
                
                currentRoundMatches.push(match);
              }
              previousRoundMatches = currentRoundMatches;
            }
          }
        }
      }
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Torneo creado con éxito'
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error al crear el torneo:', error);
    return res.status(500).json({
      message: 'Error interno al crear el torneo',
      error: error.message
    });
  }
};

/**
 * Obtiene la vista general del torneo (Zonas y Brackets).
 */
exports.getTournamentOverview = async (req, res) => {
    try {
        // Como es torneo único, buscamos el último o el único existente
        const tournament = await Tournament.findOne({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Stage,
                    as: 'stages',
                    include: [
                        {
                            model: Group,
                            as: 'groups',
                            include: [{ model: Team, as: 'teams' }]
                        }
                    ]
                }
            ]
        });

        if (!tournament) {
            return res.status(404).json({ message: 'No hay ningún torneo activo.' });
        }

        // Estructurar la respuesta según el plan
        const response = {
            name: tournament.name,
            stages: tournament.stages.map(stage => {
                const stageData = {
                    id: stage.id,
                    type: stage.type,
                    order: stage.order
                };

                if (stage.type === 'GROUP_STAGE') {
                    stageData.groups = stage.groups.map(group => ({
                        id: group.id,
                        name: group.name,
                        teams: group.teams.map(team => ({
                            id: team.id,
                            playerA: { name: team.playerA_name, category: team.playerA_category },
                            playerB: { name: team.playerB_name, category: team.playerB_category }
                        }))
                    }));
                } else if (stage.type === 'KNOCKOUT_STAGE') {
                    // Nota: Los partidos se piden en el endpoint separado /matches,
                    // pero podemos incluir un resumen o status aquí.
                    stageData.status = 'ready'; 
                }

                return stageData;
            })
        };

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el torneo' });
    }
};

/**
 * Obtiene el listado de todos los partidos del torneo.
 */
exports.getMatches = async (req, res) => {
    try {
        const tournament = await Tournament.findOne({ order: [['createdAt', 'DESC']] });
        if (!tournament) return res.status(404).json({ message: 'Torneo no encontrado' });

        const matches = await Match.findAll({
            include: [
                { model: Stage, as: 'stage', where: { tournamentId: tournament.id } },
                { model: Team, as: 'teamA' },
                { model: Team, as: 'teamB' }
            ],
            order: [['createdAt', 'ASC']]
        });

        const response = matches.map(match => ({
            id: match.id,
            round: match.round,
            status: match.status,
            courtNumber: match.courtNumber,
            startTime: match.startTime,
            placeholderA: match.teamA ? null : match.placeholderA,
            placeholderB: match.teamB ? null : match.placeholderB,
            advancesToMatchId: match.advancesToMatchId,
            teamA: match.teamA ? {
                id: match.teamA.id,
                playerA: { name: match.teamA.playerA_name },
                playerB: { name: match.teamA.playerB_name }
            } : null,
            teamB: match.teamB ? {
                id: match.teamB.id,
                playerA: { name: match.teamB.playerA_name },
                playerB: { name: match.teamB.playerB_name }
            } : null,
            scoreA: match.scoreA,
            scoreB: match.scoreB
        }));

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los partidos' });
    }
};

/**
 * Obtiene el detalle de un partido por ID.
 */
exports.getMatchById = async (req, res) => {
    try {
        const match = await Match.findByPk(req.params.id, {
            include: [
                { model: Team, as: 'teamA' },
                { model: Team, as: 'teamB' }
            ]
        });

        if (!match) return res.status(404).json({ message: 'Partido no encontrado' });

        return res.json({
            id: match.id,
            round: match.round,
            status: match.status,
            courtNumber: match.courtNumber,
            startTime: match.startTime,
            placeholderA: match.teamA ? null : match.placeholderA,
            placeholderB: match.teamB ? null : match.placeholderB,
            teamA: match.teamA ? {
                id: match.teamA.id,
                playerA: { name: match.teamA.playerA_name },
                playerB: { name: match.teamA.playerB_name }
            } : null,
            teamB: match.teamB ? {
                id: match.teamB.id,
                playerA: { name: match.teamB.playerA_name },
                playerB: { name: match.teamB.playerB_name }
            } : null,
            scoreA: match.scoreA,
            scoreB: match.scoreB
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el detalle del partido' });
    }
};

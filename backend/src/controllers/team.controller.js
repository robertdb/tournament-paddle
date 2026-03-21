const { Team } = require('../models');

/**
 * Crea una nueva pareja (Team) en la base de datos.
 */
exports.createTeam = async (req, res) => {
  try {
    console.log('DEBUG Body recieved:', JSON.stringify(req.body, null, 2));
    const { playerA, playerB, contactPhone } = req.body;

    // Los datos vienen anidados del Front: { playerA: { name, category }, playerB: { name, category }, contactPhone }
    if (!playerA || !playerB || !contactPhone) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const team = await Team.create({
      playerA_name: playerA.name,
      playerA_category: playerA.category,
      playerB_name: playerB.name,
      playerB_category: playerB.category,
      contactPhone: contactPhone
    });

    // Mapeamos a la estructura que el frontend espera (PlayersPair)
    return res.status(201).json(mapTeamToPlayersPair(team));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El teléfono ya está registrado para otra pareja.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Error al crear pareja:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Obtiene el listado de todas las parejas precargadas.
 */
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Mapeamos cada equipo a la estructura PlayersPair
    const formattedTeams = teams.map(team => mapTeamToPlayersPair(team));
    
    return res.status(200).json(formattedTeams);
  } catch (error) {
    console.error('Error al obtener parejas:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Helper para mapear el modelo plano de la DB a la estructura anidada del Frontend.
 */
function mapTeamToPlayersPair(team) {
  return {
    id: team.id,
    contactPhone: team.contactPhone,
    playerA: {
      name: team.playerA_name,
      category: team.playerA_category
    },
    playerB: {
      name: team.playerB_name,
      category: team.playerB_category
    },
    status: team.status,
    checkedInAt: team.checkedInAt,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt
  };
}


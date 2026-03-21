const { Team } = require('../models');

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
    checked_in: team.checked_in,
    checkedInAt: team.checkedInAt,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt
  };
}

/**
 * Crea un nuevo equipo (Team) en la base de datos.
 */
exports.createTeam = async (req, res) => {
  try {
    console.log('DEBUG Body received:', JSON.stringify(req.body, null, 2));
    const { playerA, playerB, contactPhone } = req.body;

    // Los datos vienen anidados del Front
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

    return res.status(201).json(mapTeamToPlayersPair(team));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El teléfono ya está registrado para otro equipo.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Error al crear equipo:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Obtiene el listado de todos los equipos precargados.
 */
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      order: [['createdAt', 'DESC']]
    });

    const formattedTeams = teams.map(team => mapTeamToPlayersPair(team));
    return res.status(200).json(formattedTeams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Actualiza la información de un equipo o confirma su inscripción (Check-In).
 */
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerA, playerB, contactPhone, checked_in } = req.body;

    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado.' });
    }

    // Actualizar campos si se proporcionan
    if (playerA) {
      if (playerA.name !== undefined) team.playerA_name = playerA.name;
      if (playerA.category !== undefined) team.playerA_category = playerA.category;
    }
    if (playerB) {
      if (playerB.name !== undefined) team.playerB_name = playerB.name;
      if (playerB.category !== undefined) team.playerB_category = playerB.category;
    }
    if (contactPhone !== undefined) {
      team.contactPhone = contactPhone;
    }

    // Lógica especial para el campo checked_in
    if (typeof checked_in !== 'undefined') {
      if (checked_in === true && !team.checked_in) {
        team.checked_in = true;
        team.status = 'checked_in';
        team.checkedInAt = new Date();
      } 
      else if (checked_in === false && team.checked_in) {
        team.checked_in = false;
        team.status = 'preloaded';
        team.checkedInAt = null;
      }
    }

    await team.save();
    return res.status(200).json(mapTeamToPlayersPair(team));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El teléfono ya está registrado para otro equipo.' });
    }
    console.error('Error al actualizar equipo:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

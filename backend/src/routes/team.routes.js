const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

// POST /api/teams - Precargar un equipo
router.post('/', teamController.createTeam);

// GET /api/teams - Obtener todos los equipos
router.get('/', teamController.getAllTeams);

// PUT /api/teams/:id - Actualizar un equipo o confirmar inscripción
router.put('/:id', teamController.updateTeam);

module.exports = router;

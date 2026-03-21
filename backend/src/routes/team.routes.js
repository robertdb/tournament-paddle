const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

// POST /api/teams - Precargar una pareja
router.post('/', teamController.createTeam);

// GET /api/teams - Obtener todas las parejas
router.get('/', teamController.getAllTeams);

module.exports = router;

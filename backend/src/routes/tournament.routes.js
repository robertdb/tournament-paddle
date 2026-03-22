const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');

// Torneo Único (Overview)
router.get('/', tournamentController.getTournamentOverview);

// Partidos del Torneo
router.get('/matches', tournamentController.getMatches);
router.get('/matches/:id', tournamentController.getMatchById);

// Creación de Torneo (OK response)
router.post('/', tournamentController.createTournament);

module.exports = router;

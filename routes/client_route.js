const express = require('express');
const router = express.Router();
const authController = require('../controller/client_controller');

// Route pour l'inscription
router.post('/inscription', authController.inscription);

// Route pour la connexion
router.post('/login', authController.login);

router.get('client/:id', authController.ConsulterCompteClient);

router.delete('client/:id', authController.deleteCompteClient);

module.exports = router;
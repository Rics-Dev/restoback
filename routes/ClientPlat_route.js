const express = require('express');
const router = express.Router();
const ClientPlat = require('../controller/ClientPlat_controller');


router.get('/platClient', ClientPlat.DonnerPlatsDisponible);
router.get('/platClient/recommandes', ClientPlat.getPlatsPourClient);
router.get('/PLatClient/:id', ClientPlat.ConsulterUnPlatClient);



module.exports = router;
const express = require('express');
const Router = express.Router();
const offregerant = require('../controller/controller_offregerant');


Router.get('/Gerant_offre', offregerant.getalloffre);

Router.post('/Gerant_offre', offregerant.addoffregerant);

Router.post('/Gerant_offre_inplat', offregerant.addoffregerant_inplat);

module.exports = Router;


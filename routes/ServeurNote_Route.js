const express = require('express');
const Router = express.Router();
const noteServeur = require('../controller/ServeurNote_Controller');

Router.post('/noteserveur', noteServeur.addServeurNote);
Router.patch('/noteserveur', noteServeur.UpdateNotePlat);

module.exports = Router;
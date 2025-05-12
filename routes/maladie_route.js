
const express = require('express');
const Router = express.Router();
const Maladie = require('../controller/maladie_controller');


Router.get('/maladie', Maladie.getAllMaladies);
Router.post('/maladie', Maladie.addMaladie);
Router.delete('/maladie/:id_maladie', Maladie.deleteMaladie);
Router.get('/maladie/:id_maladie', Maladie.getMaladieById);

module.exports = Router;
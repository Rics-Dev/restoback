const express = require('express');
const Router = express.Router();
const ClientMaladie = require('../controller/ClientMaladie_controller');


Router.post('/clientmaladie', ClientMaladie.addMaladie);
//
Router.delete('/clientmaladie/:id_client', ClientMaladie.deleteMaladie);
//
Router.get('/clientmaladie/:id_client', ClientMaladie.getMaladiesByClient);
//



module.exports = Router;
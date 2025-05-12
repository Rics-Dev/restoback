const express = require('express');
const Router = express.Router();
const Personnel = require('../controller/controller_Personnel');


Router.get('/Personnel', Personnel.DonnerPersonnel);
Router.delete('/Personnel/:id', Personnel.deletePersonnel);
Router.get('/Personnel/:id', Personnel.ConsulterUnPersonnel);
Router.patch('/Personnel/:id', Personnel.ChangerTablepourServeur);
Router.post('/login-personnel', Personnel.loginPersonnel);
Router.post('/inscription-personnel', Personnel.inscriptionPersonnel);

module.exports = Router;
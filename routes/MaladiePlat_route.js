const express = require('express');
const Router = express.Router();
const PlatMaladie = require('../controller/MaladiePlat_controller');


Router.post('/platmaladie', PlatMaladie.addMaladiePlat);
//
Router.delete('/platmaladie/:id_plat', PlatMaladie.deleteMaladie);
//
Router.get('/platmaladie/:id_plat', PlatMaladie.getMaladiesByPlat);
//



module.exports = Router;
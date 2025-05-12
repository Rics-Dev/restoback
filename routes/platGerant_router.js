const express = require('express');
const Router = express.Router();
const plats = require('../controller/controller_platGerant');


Router.get('/Gerant_plat', plats.DonnerPlats);
Router.post('/Gerant_plat', plats.AjouterPlat);
Router.post('/Gerant_plat/ingredient', plats.AjouterIngredientDansPlat);
Router.patch('/Gerant_plat/ingredient', plats.updatequantiteIngredientDansPlat);
Router.get('/Gerant_plat/:id', plats.ConsulterUnPlatGerant);
Router.delete('/Gerant_plat/:id', plats.SupprimerPlat);
Router.delete('/Gerant_plat', plats.SupprimerIngredientDansPlat);
Router.patch('/Gerant_plat', plats.update_prix_plat);

module.exports = Router;
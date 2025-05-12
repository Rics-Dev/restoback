const express = require('express');
const Router = express.Router();
const Categorie= require('../controller/Categorie_controller');


Router.post('/Categorie', Categorie.addCategorie);
Router.delete('/Categorie/:nom_categorie', Categorie.deleteCategorie);
Router.get('/Categorie', Categorie.getAllCategories);
Router.post('/ClientCategorie', Categorie.AddClientCategorie);
Router.get('/ClientCategorie/:id_client', Categorie.getClientCategorie);
Router.delete('/ClientCategorie/:id_client', Categorie.deleteClientCategorie);

module.exports = Router;
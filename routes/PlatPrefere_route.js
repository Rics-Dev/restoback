
const express = require('express');
const Router = express.Router();
const PlatFavorie = require('../controller/PlatPrefClient_controller');


Router.get('/platfavorie/:id_client', PlatFavorie.getplatByclient);
Router.post('/platfavorie', PlatFavorie.addPlatListe);
Router.delete('/platfavorie/:id_client', PlatFavorie.deletePlatListe);


module.exports = Router;
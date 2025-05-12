const express = require('express');
const Router = express.Router();
const reservation = require('../controller/controller_reservation');

Router.get('/reservation', reservation.getallreservation);
Router.post('/reservation', reservation.addreservation);
Router.get('/reservation/:id_client', reservation.findreservationbyclient);
Router.delete('/reservation/:id_client', reservation.deletereservationbyclient);
Router.get('/table', reservation.gettable);

module.exports = Router;

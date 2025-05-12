const express = require('express');
const Router = express.Router();
const notePlat = require('../controller/PlatNote_Controller');

Router.post('/noteplat', notePlat.addNotePlat);
Router.patch('/noteplat', notePlat.UpdateNotePlat);

module.exports = Router;
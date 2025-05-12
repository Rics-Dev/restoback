const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/service_controller');

router.get('/:clientId', recommendationController.getRecommendations);

module.exports = router;
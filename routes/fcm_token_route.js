const express = require('express');
const router = express.Router();
const { saveFcmToken } = require('../controller/fcm_controller');

router.post('/fcm-token', saveFcmToken);


module.exports = router;

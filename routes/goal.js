const express = require('express');
const router = express.Router();
const { handleGoal } = require('../utils/goalHandler');

router.post('/', handleGoal);

module.exports = router;

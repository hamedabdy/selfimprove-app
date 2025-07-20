const express = require('express');
const router = express.Router();
const { handleStatus } = require('../utils/statusHandler');

router.get('/', handleStatus);

module.exports = router;

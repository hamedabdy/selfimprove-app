
const express = require('express');
const router = express.Router();
const { ShellCommandExecutor } = require('../utils/ShellCommandExecutor');
const logger = require('../utils/logger');

// POST /api/exec-shell
router.post('/exec-shell', async (req, res) => {
    const { command } = req.body;
    logger.info('API /exec-shell called with command: %s', command);
    if (!command || typeof command !== 'string') {
        logger.warn('No command provided to /exec-shell');
        return res.status(400).json({ error: 'No command provided.' });
    }
    try {
        const { stdout, stderr } = await ShellCommandExecutor.execAsync(command);
        logger.info('Command executed successfully via API.');
        res.json({ stdout, stderr });
    } catch (err) {
        logger.error('Error executing command via API: %s', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// POST /api/exec-js
router.post('/exec-js', async (req, res) => {
    const { code } = req.body;
    logger.info('API /exec-js called with code: %s', code);
    if (!code || typeof code !== 'string') {
        logger.warn('No code provided to /exec-js');
        return res.status(400).json({ error: 'No code provided.' });
    }
    try {
        // Capture console.log output
        let logs = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            logs.push(args.map(String).join(' '));
            originalConsoleLog.apply(console, args);
        };
        let result;
        try {
            // Wrap code in an async IIFE and await its result
            const fn = new Function(`return (async () => { ${code} })()`);
            result = await fn();
        } catch (e) {
            throw e;
        } finally {
            console.log = originalConsoleLog;
        }
        logger.info('JS code executed successfully via API.');
        res.json({ result, logs });
    } catch (err) {
        logger.error('Error executing JS code via API: %s', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

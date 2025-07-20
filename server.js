const express = require('express');
const path = require('path');
require('dotenv').config();
const { exec } = require('child_process');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
const goalRouter = require('./routes/goal');
const execShellRoute = require('./routes/execShell');
const execJsRoute = require('./routes/execJs');

// Start server
app.listen(PORT, () => {
    const fs = require('fs');
    if (!fs.existsSync('./modules')) fs.mkdirSync('./modules');
    logger.info(`Self-improving app running at http://localhost:${PORT}`);
});

app.use('/api/goal', goalRouter);
// Add new route to handle shell command execution
app.use('/api', execShellRoute);
// Add new route to handle JS code execution
app.use('/api', execJsRoute);

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error: %s', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

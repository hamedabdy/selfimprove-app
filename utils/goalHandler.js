const fs = require('fs');
const path = require('path');
const { LlmApiClient } = require('./LlmApiClient');
const { FileUpdateManager } = require('./FileUpdateManager');

// --- Utility: Gather context from files ---
function getAppContext() {
    const modules = fs.readdirSync('./modules').filter(f => f.endsWith('.js'));
    const publicFiles = fs.readdirSync('./public').filter(f => f.endsWith('.js') || f.endsWith('.html'));
    const serverFiles = fs.readdirSync('./').filter(f => f.endsWith('.js'));
    const contextFiles = [
        ...publicFiles.map(p => path.join(__dirname, '../public', p)),
        ...modules.map(m => path.join(__dirname, '../modules', m)),
        ...serverFiles.map(s => path.join(__dirname, '../', s))
    ];
    let contextText = '';
    contextFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const relPath = path.relative(path.join(__dirname, '..'), filePath);
            let content = fs.readFileSync(filePath, 'utf8');
            contextText += `\n\n// file: ${relPath}\n\n${content}`;
        }
    });
    return { contextText, modules };
}

// --- Main handler ---
exports.handleGoal = async (req, res) => {
    const { goal } = req.body;
    if (!goal || typeof goal !== 'string' || goal.trim() === '') {
        return res.status(400).json({ error: 'Invalid goal provided.' });
    }
    const { contextText, modules } = getAppContext();
    const llmClient = new LlmApiClient();
    const { promptEngineer, llmPrompt } = llmClient.buildPrompts(goal, contextText);
    try {
        const llmResponse = await llmClient.requestLlmUpdate(goal, promptEngineer, llmPrompt);
        const parsed = llmClient.parseLlmResponse(llmResponse);
        if (parsed.html) {
            res.json({ html: parsed.html });
            return;
        }
        const fileUpdates = parsed.fileUpdates;
        if (!Array.isArray(fileUpdates) || fileUpdates.length === 0) {
            res.json({ message: 'No changes made (empty update array from LLM).', modules });
            return;
        }
        const fileManager = new FileUpdateManager();
        const improvementsLog = fileManager.handleFileUpdates(fileUpdates, goal, modules);
        res.json({ message: `Updated files: ${fileUpdates.map(f=>f.filename).join(', ')}\n\nSteps:\n${improvementsLog.join('\n')}`, modules });
    } catch (err) {
        if (err.response) {
            console.error('API Error:', {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data
            });
        } else {
            console.error('Error:', err.message);
        }
        res.status(500).json({ error: err.message || 'LLM API failed.' });
    }
};

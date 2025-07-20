
const fs = require('fs-extra');
const path = require('path');
const Ajv = require('ajv');

class FileUpdateManager {
    constructor({ logger } = {}) {
        this.backupRoot = path.join(__dirname, '../backups');
        fs.ensureDirSync(this.backupRoot);
        this.logger = logger || this.defaultLogger;
        this.ajv = new Ajv();
    }

    defaultLogger(message) {
        // Simple fallback logger
        console.log(message);
    }

    backupFile(absPath, backupDir, filename, improvementsLog) {
        fs.ensureDirSync(backupDir);
        if (fs.existsSync(absPath)) {
            const backupPath = path.join(backupDir, `${Date.now()}.bak`);
            fs.copySync(absPath, backupPath);
            improvementsLog.push(`Backed up ${filename} to ${backupPath}`);
            return backupPath;
        }
        return null;
    }

    revertFile(backupPath, absPath, filename, reason, improvementsLog) {
        if (backupPath && fs.existsSync(backupPath)) {
            fs.copySync(backupPath, absPath);
            improvementsLog.push(`Reverted ${filename} due to ${reason}.`);
        }
    }

    validateJavaScript(codeContent) {
        try {
            // eslint-disable-next-line no-new-func
            new Function(codeContent);
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    validateJSON(codeContent, schema = null) {
        try {
            const json = JSON.parse(codeContent);
            if (schema) {
                const validate = this.ajv.compile(schema);
                const valid = validate(json);
                if (!valid) {
                    return { valid: false, error: this.ajv.errorsText(validate.errors) };
                }
            }
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    handleFileUpdates(fileUpdates, goal, modules = {}) {
        const improvementsLog = [];
        for (const fu of fileUpdates) {
            if (fu.no_changes === true) {
                improvementsLog.push(`No changes needed for ${fu.filename} (no_changes=true)`);
                continue;
            }
            const absPath = path.join(__dirname, '../', fu.filename);
            let codeContent = typeof fu.updated_code === 'string' ? fu.updated_code.replace(/\r/g, '') : '';
            codeContent = codeContent.replace(/\\n/g, '\n');
            const isTruncated = codeContent.includes('...TRUNCATED...');
            const backupDir = path.join(this.backupRoot, fu.filename.replace(/[\/]/g, '_'));
            const backupPath = this.backupFile(absPath, backupDir, fu.filename, improvementsLog);

            if (!isTruncated && codeContent.replace(/\s/g, '').length > 0) {
                fs.writeFileSync(absPath, codeContent);
                let testResult = 'Not tested';
                let validation = { valid: true };
                if (fu.detected_language === 'js' || fu.detected_language === 'javascript') {
                    validation = this.validateJavaScript(codeContent);
                    if (!validation.valid) {
                        testResult = 'Syntax Error: ' + validation.error;
                        this.revertFile(backupPath, absPath, fu.filename, 'syntax error', improvementsLog);
                    } else {
                        testResult = 'Syntax OK';
                    }
                } else if (fu.detected_language === 'json') {
                    // Optionally support JSON schema validation if provided in fu.json_schema
                    validation = this.validateJSON(codeContent, fu.json_schema);
                    if (!validation.valid) {
                        testResult = 'JSON Error: ' + validation.error;
                        this.revertFile(backupPath, absPath, fu.filename, 'JSON error', improvementsLog);
                    } else {
                        testResult = 'JSON OK';
                    }
                }
                improvementsLog.push(`Updated ${fu.filename} (${fu.detected_language}): ${fu.change_description || ''} [${testResult}]`);
                if (fu.change_explanation) {
                    improvementsLog.push(`Explanation: ${fu.change_explanation}`);
                }
            } else {
                improvementsLog.push(`Skipped ${fu.filename} (empty or truncated content)`);
                if (isTruncated) {
                    this.revertFile(backupPath, absPath, fu.filename, 'truncated content', improvementsLog);
                }
            }
        }
        const logPath = path.join(__dirname, '../improvements.log');
        const logEntry = `[${new Date().toISOString()}] Goal: ${goal}\n` + improvementsLog.join('\n') + '\n\n';
        fs.appendFileSync(logPath, logEntry);
        if (this.logger) {
            this.logger(logEntry);
        }
        return improvementsLog;
    }
}

module.exports = { FileUpdateManager };

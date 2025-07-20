
const { execSync, exec } = require('child_process');
const logger = require('./logger');

class ShellCommandExecutor {
    /**
     * Execute a shell command synchronously and return stdout or throw error.
     * @param {string} command - The shell command to execute.
     * @param {object} [options] - Options for execSync.
     * @returns {string} - The stdout from the command.
     */

    static execSync(command, options = {}) {
        logger.info('Executing sync command: %s', command);
        try {
            const output = execSync(command, { stdio: 'pipe', encoding: 'utf8', ...options });
            logger.info('Sync command output: %s', output);
            return output;
        } catch (err) {
            logger.error('Sync command error: %s', err.message);
            throw new Error(err.stdout ? err.stdout.toString() : err.message);
        }
    }

    /**
     * Execute a shell command asynchronously and return a Promise.
     * @param {string} command - The shell command to execute.
     * @param {object} [options] - Options for exec.
     * @returns {Promise<{ stdout: string, stderr: string }>} - Resolves with stdout and stderr.
     */

    static execAsync(command, options = {}) {
        logger.info('Executing async command: %s', command);
        // Default timeout: 10 seconds, maxBuffer: 1MB
        const defaultTimeout = 10000;
        const defaultMaxBuffer = 1024 * 1024; // 1MB
        return new Promise((resolve, reject) => {
            exec(
                command,
                { encoding: 'utf8', timeout: defaultTimeout, maxBuffer: defaultMaxBuffer, ...options },
                (error, stdout, stderr) => {
                    if (error) {
                        logger.error('Async command error: %s | stderr: %s', error.message, stderr);
                        reject(new Error(stderr || error.message));
                    } else {
                        logger.info('Async command output: %s', stdout);
                        resolve({ stdout, stderr });
                    }
                }
            );
        });
    }
}

module.exports = { ShellCommandExecutor };

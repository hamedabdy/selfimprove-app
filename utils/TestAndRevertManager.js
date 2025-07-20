
const fs = require('fs-extra');
const path = require('path');
const { ShellCommandExecutor } = require('./ShellCommandExecutor');

class TestAndRevertManager {
    constructor({ logger } = {}) {
        this.logger = logger || ((msg) => console.log(msg));
    }


    runAllTests() {
        try {
            ShellCommandExecutor.execSync('npx jest --ci --runInBand');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    revertFiles(backupMap, log = []) {
        for (const [file, backupPath] of Object.entries(backupMap)) {
            if (fs.existsSync(backupPath)) {
                fs.copySync(backupPath, file);
                log.push(`Reverted ${file} to backup ${backupPath} due to test failure.`);
                this.logger(`Reverted ${file} to backup ${backupPath} due to test failure.`);
            }
        }
    }

    handlePostUpdateTesting(changedFiles, backupPaths, improvementsLog = []) {
        const testResult = this.runAllTests();
        if (!testResult.success) {
            this.revertFiles(backupPaths, improvementsLog);
            improvementsLog.push('Test suite failed. All changed files reverted.');
            improvementsLog.push(`Test error: ${testResult.error}`);
            this.logger('Test suite failed. All changed files reverted.');
        } else {
            improvementsLog.push('All tests passed after update.');
            this.logger('All tests passed after update.');
        }
        return testResult.success;
    }
}

module.exports = { TestAndRevertManager };

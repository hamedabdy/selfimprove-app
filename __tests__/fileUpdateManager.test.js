const fs = require('fs-extra');
const path = require('path');
const { FileUpdateManager } = require('../utils/FileUpdateManager');

describe('FileUpdateManager', () => {
    const testDir = path.join(__dirname, '../__test_tmp__');
    const testFile = path.join(testDir, 'test.js');
    const backupDir = path.join(__dirname, '../backups/test_js');
    const logPath = path.join(__dirname, '../improvements.log');
    let manager;

    beforeAll(() => {
        fs.ensureDirSync(testDir);
        fs.writeFileSync(testFile, 'console.log("original");');
        manager = new FileUpdateManager();
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        if (fs.existsSync(backupDir)) fs.removeSync(backupDir);
        if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
    });

    afterAll(() => {
        fs.removeSync(testDir);
    });

    test('updates file with valid JS and creates backup', () => {
        const updates = [{
            filename: `__test_tmp__/test.js`,
            updated_code: 'console.log("updated");',
            detected_language: 'js',
            change_description: 'Update log',
        }];
        const logs = manager.handleFileUpdates(updates, 'Update log');
        expect(fs.readFileSync(testFile, 'utf8')).toBe('console.log("updated");');
        expect(logs.join(' ')).toMatch(/Backed up/);
        expect(logs.join(' ')).toMatch(/Updated/);
    });

    test('reverts file on JS syntax error', () => {
        fs.writeFileSync(testFile, 'console.log("original");');
        const updates = [{
            filename: `__test_tmp__/test.js`,
            updated_code: 'console.log("broken"', // missing )
            detected_language: 'js',
            change_description: 'Break code',
        }];
        const logs = manager.handleFileUpdates(updates, 'Break code');
        expect(fs.readFileSync(testFile, 'utf8')).toBe('console.log("original");');
        expect(logs.join(' ')).toMatch(/Reverted/);
        expect(logs.join(' ')).toMatch(/Syntax Error/);
    });

    test('skips update if no_changes is true', () => {
        const updates = [{
            filename: `__test_tmp__/test.js`,
            updated_code: '',
            detected_language: 'js',
            change_description: 'No change',
            no_changes: true
        }];
        const logs = manager.handleFileUpdates(updates, 'No change');
        expect(logs.join(' ')).toMatch(/No changes needed/);
    });

    test('reverts file on truncated content', () => {
        fs.writeFileSync(testFile, 'console.log("original");');
        const updates = [{
            filename: `__test_tmp__/test.js`,
            updated_code: '...TRUNCATED...',
            detected_language: 'js',
            change_description: 'Truncated',
        }];
        const logs = manager.handleFileUpdates(updates, 'Truncated');
        expect(fs.readFileSync(testFile, 'utf8')).toBe('console.log("original");');
        expect(logs.join(' ')).toMatch(/truncated content/);
    });
});

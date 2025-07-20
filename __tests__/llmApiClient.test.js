const { LlmApiClient } = require('../utils/LlmApiClient');

describe('LlmApiClient', () => {
    let client;
    beforeAll(() => {
        process.env.LLM_API_BASE_URL = 'http://localhost:';
        process.env.LLM_API_V = '';
        process.env.LLM_API_CHAT_ENDPOINT = '/chat';
        process.env.LLM_NAME = 'test-model';
        process.env.LLM_API_KEY = 'test-key';
        client = new LlmApiClient();
    });

    test('buildPrompts returns correct structure', () => {
        const { promptEngineer, llmPrompt } = client.buildPrompts('goal', 'context');
        expect(promptEngineer).toMatch(/goal/);
        expect(llmPrompt).toMatch(/goal/);
        expect(llmPrompt).toMatch(/context/);
    });

    test('parseLlmResponse parses array', () => {
        const mockResp = { data: { choices: [{ message: { content: '[{"filename":"a.js","updated_code":"code","detected_language":"js","change_summary":"desc"}]' } }] } };
        const { fileUpdates } = client.parseLlmResponse(mockResp);
        expect(Array.isArray(fileUpdates)).toBe(true);
        expect(fileUpdates[0].filename).toBe('a.js');
    });

    test('parseLlmResponse parses single object', () => {
        const mockResp = { data: { choices: [{ message: { content: '{"filename":"a.js","updated_code":"code","detected_language":"js","change_summary":"desc"}' } }] } };
        const { fileUpdates } = client.parseLlmResponse(mockResp);
        expect(Array.isArray(fileUpdates)).toBe(true);
        expect(fileUpdates[0].filename).toBe('a.js');
    });

    test('parseLlmResponse throws on invalid JSON', () => {
        const mockResp = { data: { choices: [{ message: { content: 'not json' } }] } };
        expect(() => client.parseLlmResponse(mockResp)).toThrow('LLM did not return valid JSON');
    });

    test('parseLlmResponse returns html if html', () => {
        const mockResp = { data: '<!DOCTYPE html><html></html>' };
        const result = client.parseLlmResponse(mockResp);
        expect(result.html).toMatch(/DOCTYPE/);
    });

    test('_getChatApiUrl builds url from env', () => {
        expect(client._getChatApiUrl()).toMatch(/localhost/);
    });
});

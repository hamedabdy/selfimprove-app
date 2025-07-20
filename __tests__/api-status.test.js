require('dotenv').config();
const axios = require('axios');

describe('LLM API Health Check', () => {
  it('should connect to the LLM chat API and return a success status and message', async () => {
    const baseUrl = process.env.LLM_API_BASE_URL;
    const apiV = process.env.LLM_API_V;
    const chatEndpoint = process.env.LLM_API_CHAT_ENDPOINT;
    const llmApiKey = process.env.LLM_API_KEY;
    const llmName = process.env.LLM_NAME;
    const chatUrl = `${baseUrl}${apiV}${chatEndpoint}`;
    expect(chatUrl).toBeTruthy();
    expect(llmApiKey).toBeTruthy();
    expect(llmName).toBeTruthy();

    const response = await axios.post(
      chatUrl,
      {
        model: llmName,
        messages: [{ role: 'user', content: 'ping' }],
        response_format: { type: 'text' }
      },
      {
        headers: {
          'Authorization': `Bearer ${llmApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'localhost',
          'X-Title': 'self-improving-app',
        }
      }
    );
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('choices');
    expect(response.data.choices[0]).toHaveProperty('message');
    expect(response.data.choices[0].message).toHaveProperty('content');
    console.log('LLM API response:', response.data.choices[0].message.content);
  });

  it('should GET the models endpoint and return a list of models', async () => {
    const baseUrl = process.env.LLM_API_BASE_URL;
    const apiV = process.env.LLM_API_V;
    const modelsEndpoint = process.env.LLM_API_MODELs_ENDPOINT;
    const llmApiKey = process.env.LLM_API_KEY;
    const modelsUrl = `${baseUrl}${apiV}${modelsEndpoint}`;
    expect(modelsUrl).toBeTruthy();
    expect(llmApiKey).toBeTruthy();

    const response = await axios.get(modelsUrl, {
      headers: {
        'Authorization': `Bearer ${llmApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'localhost',
        'X-Title': 'self-improving-app',
      }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
    console.log('LLM API models:', response.data.data);
  });
});

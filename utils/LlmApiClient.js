const axios = require('axios');

class LlmApiClient {
    constructor() {
        this.apiUrl = this._getChatApiUrl();
        this.model = process.env.LLM_NAME;
        this.headers = {
            "Authorization": `Bearer ${process.env.LLM_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "localhost",
            "X-Title": "self-improving-app",
        };
        this.response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": "code_update",
                "strict": true,
                "schema": {
                    "type": "object",
                    "properties": {
                        "filename": {
                            "type": "string",
                            "description": "path and the name of the file to be updated"
                        },
                        "updated_code": {
                            "type": "string",
                            "description": "Updated code content. Do not include any comments or explanations, just the code itself."
                        },
                        "detected_language": {
                            "type": "string",
                            "description": "Detected programming language of the file"
                        },
                        "change_summary": {
                            "type": "string",
                            "description": "summary of the changes made"
                        },
                        "no_changes": {
                            "type": "boolean",
                            "description": "Indicates if no changes were made"
                        },
                        "exec_time": {
                            "type": "string",
                            "description": "duration of prompt execution in seconds"
                        }
                    },
                    "required": ["filename", "updated_code", "detected_language", "change_summary", "no_changes", "exec_time"],
                    "additionalProperties": false
                }
            }
        };
    }

    buildPrompts(goal, contextText) {
        const promptEngineer = `You are an expert prompt engineer. I have a goal for a self-improving web app. Please optimize the goal description to be more specific and actionable. The goal is: "${goal}".
            Provide only the optimized goal description, without any additional text or explanation.
            If the goal is already specific and actionable, reply with the same goal.
            Here is the current app context (original code):
            ${contextText}`;
        const llmPrompt = `You are an assistant for a self-improving web app.
            I have the following code. Please update it according to the requirements I will describe.
            Return an array of structured JSON object for each file that needs to be updated.
            Change description : "${goal}"
            Here is the current app context (original code):
            ${contextText}
            If nothing needs to be changed, reply with "[]".`;
        return { promptEngineer, llmPrompt };
    }

    async requestLlmUpdate(goal, promptEngineer, llmPrompt) {
        return axios.post(this.apiUrl, {
            model: this.model,
            messages: [
                { role: "system", content: "You are a helpful assistant for a self-improving web app." },
                { role: "user", content: promptEngineer },
                { role: "assistant", content: "Please provide the optimized goal description." },
                { role: "user", content: llmPrompt }
            ],
            response_format: this.response_format,
        }, {
            headers: this.headers
        });
    }

    parseLlmResponse(llmResponse) {
        let output = '';
        if (llmResponse.data.choices && llmResponse.data.choices[0] && llmResponse.data.choices[0].message && llmResponse.data.choices[0].message.content) {
            console.log('LLM Response content :', llmResponse.data.choices[0].message.content);
            output = llmResponse.data.choices[0].message.content;
        } else if (typeof llmResponse.data === 'string' && llmResponse.data.trim().startsWith('<!DOCTYPE html')) {
            return { html: llmResponse.data };
        } else {
            throw new Error('Invalid LLM response format.');
        }
        let fileUpdates = [];
        try {
            const parsed = JSON.parse(output);
            if (Array.isArray(parsed)) {
                fileUpdates = parsed;
            } else if (parsed && Array.isArray(parsed.updates)) {
                fileUpdates = parsed.updates;
            } else if (parsed && parsed.filename && parsed.updated_code) {
                fileUpdates = [parsed];
            } else {
                throw new Error('LLM did not return a valid array or object for file updates.');
            }
        } catch (e) {
            throw new Error('LLM did not return valid JSON for file updates.');
        }
        return { fileUpdates };
    }

    _getChatApiUrl() {
        return `${process.env.LLM_API_BASE_URL}${process.env.LLM_API_V}${process.env.LLM_API_CHAT_ENDPOINT}`;
    }
}

module.exports = LlmApiClient;
# selfimprove-app

## Project Summary

selfimprove-app is a self-improving web application that leverages LLMs (Large Language Models) to iteratively enhance its own codebase based on user-defined goals. The app provides endpoints for executing JavaScript and shell commands, managing goals, and updating itself through LLM-driven suggestions. It is designed for experimentation with autonomous software improvement and AI-assisted development workflows.

### Key Features
- Modular Express.js backend
- LLM-powered code update and goal management
- REST API for executing code and shell commands
- Logging and backup of code changes
- Automated testing with Jest

## Example .env Configuration

Create a `.env` file in the project root with the following content (update values as needed):

```env
PORT=5000
LLM_API_BASE_URL=http://localhost:1234
LLM_API_V=/v1
LLM_API_CHAT_ENDPOINT=/chat/completions
LLM_API_MODELs_ENDPOINT=/models
LLM_API_KEY=your-llm-api-key-here
LLM_NAME=qwen/qwen2.5-coder-14b
```

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` file as shown above.
3. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
4. The app will be available at [http://localhost:5000](http://localhost:5000) (or your configured PORT).

## Testing

Run all tests using Jest:
```bash
npm test
```

Test files are located in the `__tests__/` directory and cover API endpoints and core modules.

## Project Structure

- `server.js` - Main Express server
- `routes/` - API route handlers
- `utils/` - Utility modules (LLM client, logger, etc.)
- `public/` - Static frontend files
- `__tests__/` - Automated tests

## Notes
- Requires Node.js 18+ and npm
- Ensure your LLM API is running and accessible as configured in `.env`
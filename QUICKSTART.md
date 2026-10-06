// Quick Start Guide for Chatbot API

/**
 * SETUP STEPS:
 * 
 * 1. Install Ollama
 *    - macOS/Linux: curl -fsSL https://ollama.ai/install.sh | sh
 *    - Windows: Download from https://ollama.ai
 * 
 * 2. Pull a model
 *    ```
 *    ollama pull llama2
 *    ollama serve
 *    ```
 * 
 * 3. Install dependencies
 *    ```
 *    npm install
 *    or
 *    pnpm install
 *    ```
 * 
 * 4. Configure .env file
 *    ```
 *    cp .env.example .env
 *    # Edit with your database credentials
 *    ```
 * 
 * 5. Start the application
 *    ```
 *    npm run start:dev
 *    ```
 * 
 * 6. Test the API
 *    See TESTING.md for cURL examples
 */

/**
 * API Examples:
 * 
 * POST /chat/message - Send a message to the chatbot
 * GET /chat/history - Get conversation history
 * POST /chat/clear - Clear conversation history
 * GET /chat/health - Check if Ollama is accessible
 */

export const QUICK_START = `
QUICK START - Chatbot API

1. Start Ollama:
   ollama serve

2. Install and run (in chatbot-api directory):
   npm install
   npm run start:dev

3. Copy .env.example to .env and update database credentials

4. API will run on http://localhost:3001

5. Try the health check:
   curl http://localhost:3001/chat/health

6. Send a message:
   curl -X POST http://localhost:3001/chat/message \\
     -H "Content-Type: application/json" \\
     -d '{"message": "What is user 1 balance?"}'
`;

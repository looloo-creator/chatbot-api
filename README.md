# Chatbot API - AI Assistant for Tour Payment Management

A backend service that uses Llama through Ollama to answer questions about tours, member balances, and accounts. Operational records and private knowledge are stored in PostgreSQL with pgvector.

## Architecture

```
┌─────────────────────┐
│   Web/Mobile UI     │
└──────────┬──────────┘
           │
    ┌──────▼──────────────────────┐
    │    Chatbot API (Nest.js)    │
    ├─────────────────────────────┤
    │ • Chat Controller           │
    │ • Ollama LLM Integration    │
    │ • Tool Calling System       │
    └──────┬──────────────┬───────┘
           │              │
    ┌──────▼────┐    ┌────▼────────┐
    │  Ollama    │    │  Database   │
    │  (Local)   │    │  Services   │
    └────────────┘    └────┬────┬──┘
                           │    │
                    ┌──────▼──┐ └──────────┐
                    │ PostgreSQL + pgvector │
                    │ users, tours, accounts │
                    │ and assistant knowledge│
                    └────────────────────────┘
```

## Features

- **Tool Calling**: LLM can automatically call predefined tools to fetch data
- **Single Database**: User, tour, member, account, and assistant knowledge data use PostgreSQL
- **RAG**: Ollama embeddings retrieve relevant private knowledge from pgvector
- **Local LLM**: Uses Ollama for privacy and offline capability
- **Conversation Memory**: Maintains chat history for context-aware responses
- **Balance Queries**: Answer questions about user/member balances
- **Natural Language**: Ask questions in plain English

## Prerequisites

### 1. Install Ollama

**On macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**On Windows:**
Download from https://ollama.ai

### 2. Pull a Model

```bash
# Pull and run llama2 (recommended, ~4GB)
ollama pull llama2

# or for faster inference (smaller model)
ollama pull mistral

# Run the model
ollama serve
```

The Ollama server will run on `http://localhost:11434` by default.

### 3. Ensure Databases are Running

Make sure the PostgreSQL database migrated by `looloo-api` and the Ollama server are running.

## Installation

```bash
# Navigate to chatbot-api directory
cd chatbot-api

# Install dependencies
npm install
# or
pnpm install

# Create .env file from template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

Set `JWT_SECRET_KEY` to the same value used by `looloo-api`. The web app sends
its login token to the chat API, which verifies the token and scopes history by
user and conversation ID. Set `CORS_ORIGINS` to the browser origins that call
the API; localhost development origins are allowed by default.

## Configuration (.env)

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET_KEY=replace-with-the-same-secret-used-by-looloo-api
CORS_ORIGINS=http://localhost:4200,http://localhost:8080,http://localhost:18080

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
# Options: llama2, mistral, neural-chat, etc.

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=looloo
PG_SSL=false

# API Configuration
LOOLOO_API_URL=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## API Endpoints

### 1. Send Message
```
POST /chat/message
Content-Type: application/json
Authorization: Bearer <looloo-login-token>

{
  "conversationId": "demo-chat-001",
  "message": "What's the balance for user with ID 5?"
}

Response:
{
  "success": true,
  "response": "User John Doe (ID: 5) has a balance of $1,250.50...",
  "toolResults": [
    {
      "tool": "get_user_balance",
      "result": {...}
    }
  ]
}
```

### 2. Get Conversation History
```
GET /chat/history

Response:
{
  "history": [
    {
      "role": "user",
      "content": "What's John's balance?"
    },
    {
      "role": "assistant",
      "content": "..."
    }
  ]
}
```

### 3. Clear Conversation
```
POST /chat/clear

Response:
{
  "message": "Conversation history cleared"
}
```

### 4. Health Check
```
GET /chat/health

Response:
{
  "status": "healthy",
  "message": "Ollama is running and accessible"
}
```

## Example Queries

Try asking the chatbot questions like:

1. **Balance Queries:**
   - "What's the balance for user 5?"
   - "Show me all users and their balances"
   - "What's member X's current balance?"

2. **Tour Information:**
   - "Get payment status for tour ID 123"
   - "Show me all members with their balances"

3. **Account Information:**
   - "What's the account balance for account ID 456?"
   - "Tell me about John's account"

## Available Tools

The chatbot has access to these tools:

1. **get_my_tours** - List the signed-in user's tours
2. **get_user_balance** - Get the signed-in user's collection, expenditure, and net balance totals
3. **get_member_balance** - Get a member's balance, splitting each account among selected members
4. **get_all_members_with_balance** - List the signed-in user's members
5. **get_account_balance** - Get an account belonging to the signed-in user
6. **get_tour_payment_status** - Get tour collections, expenditures, and balance
7. **search_user_by_name** - Search the signed-in user's members by name

## Architecture Details

### Tool Calling Flow

```
User Query
    ↓
OllamaService receives query
    ↓
LLM analyzes and detects needed tools
    ↓
ToolsService executes tool calls
    ↓
PostgreSQL fetches scoped records; pgvector retrieves relevant knowledge
    ↓
Results returned to LLM
    ↓
LLM generates natural language response
    ↓
Response sent to user
```

### Database Layer

- **PostgresService**: Handles PostgreSQL user and optional transaction queries
- **pgvector**: Stores owner-scoped knowledge chunks and retrieves them by Ollama embedding similarity
- Connection pooling for better performance
- Error handling and logging

### LLM Integration

- Uses Ollama API for local model inference
- Supports multiple models (Llama2, Mistral, etc.)
- Conversation history maintained for context
- Tool definitions provided to LLM in system prompt

## Next Steps: Vector Database Integration

For future improvements, we can add:

1. **Vector Embeddings**: Store transaction history as embeddings
2. **Semantic Search**: Find similar transactions or patterns
3. **RAG (Retrieval-Augmented Generation)**:
   - Embed historical queries and answers
   - Retrieve similar contexts for better responses
4. **Recommended Vector DBs**:
   - Pinecone (managed)
   - Weaviate (self-hosted)
   - Milvus (lightweight)
   - LanceDB (for local development)

## Troubleshooting

### Ollama Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```
**Solution**: Make sure Ollama is running:
```bash
ollama serve
```

### Model Not Found
```
Error: model 'llama2' not found
```
**Solution**: Pull the model:
```bash
ollama pull llama2
```

### Database Connection Error
- Verify PostgreSQL is running on configured host/port
- Verify credentials in .env

### Out of Memory
If Ollama runs out of memory:
- Use a smaller model: `ollama pull mistral`
- Reduce context window in prompts
- Increase system RAM or swap

## Local LLM Model Recommendations

| Model | Size | Speed | Quality | Memory |
|-------|------|-------|---------|--------|
| Mistral | 7B | Fast | Good | 4GB |
| Llama2 | 7B/13B | Medium | Very Good | 4GB/8GB |
| Neural-Chat | 7B | Fast | Good | 4GB |
| SQLCoder | 7B | Fast | Excellent for SQL | 4GB |

For SQL-specific tasks, consider `sqlcoder`:
```bash
ollama pull sqlcoder
# Update OLLAMA_MODEL=sqlcoder in .env
```

## Performance Tips

1. **Use GPU**: If available, Ollama will use GPU automatically
2. **Smaller Models**: Use Mistral for faster responses
3. **Batch Processing**: Send multiple queries together when possible
4. **Connection Pooling**: PostgreSQL pool is configured in the API
5. **Caching**: Can be added for frequently asked questions

## Security Considerations

- [ ] Validate user input before passing to LLM
- [ ] Implement rate limiting on chat endpoint
- [ ] Add authentication/authorization  
- [ ] Sanitize database query parameters
- [ ] Use environment variables for sensitive data
- [ ] Monitor for prompt injection attacks

## Production Deployment

For deployment:

1. Use environment variables for all configuration
2. Set `NODE_ENV=production`
3. Use process manager (PM2, systemd)
4. Configure reverse proxy (nginx)
5. Add monitoring and logging
6. Consider using Kubernetes for scaling
7. Run Ollama as separate service with proper resource limits

## License

UNLICENSED

## Contributing

For improvements or bug fixes, please follow the existing code structure and patterns.

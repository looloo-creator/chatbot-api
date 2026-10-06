# Architecture Documentation

## Project Structure

```
chatbot-api/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root Nest.js module
│   │
│   ├── chat/                   # Chat module
│   │   ├── chat.controller.ts  # HTTP endpoints
│   │   ├── chat.service.ts     # Business logic
│   │   └── chat.module.ts      # Module definition
│   │
│   ├── llm/                    # LLM integration
│   │   └── ollama.service.ts   # Ollama client & tool calling
│   │
│   ├── tools/                  # Tool definitions & execution
│   │   ├── tools.ts            # Tool definitions
│   │   └── tools.service.ts    # Tool execution service
│   │
│   └── database/               # Database services
│       ├── postgres.service.ts # PostgreSQL operations
│       └── mongodb.service.ts  # MongoDB operations
│
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── QUICKSTART.md
└── TESTING.md
```

## Data Flow

### Chat Message Flow
```
Client Request
    ↓
ChatController.sendMessage()
    ↓
ChatService.processMessage()
    ↓
OllamaService.chat()
    ├─ Add message to history
    ├─ Build system prompt with tools
    ├─ Call Ollama API
    ├─ Parse tool calls from response
    ├─ ToolsService.executeToolCall()
    │  ├─ PostgresService.query()
    │  └─ MongodbService.*()
    ├─ Send results back to Ollama
    └─ Return final response
    ↓
Response to Client
```

## Tool Calling Mechanism

1. **Tool Definition**: Each tool has:
   - name: Tool identifier
   - description: What it does
   - parameters: JSON schema for arguments

2. **LLM Tool Detection**:
   - System prompt includes all tool definitions
   - LLM decides if tools are needed
   - LLM outputs tool calls in format: `TOOL_CALL(tool_name: {params})`

3. **Tool Execution**:
   - ToolsService parses tool calls from LLM response
   - Executes each tool with provided parameters
   - Collects results

4. **LLM Response Generation**:
   - Tool results fed back to LLM
   - LLM generates natural language response
   - User receives comprehensive answer

## Database Integration

### PostgreSQL (Users & optional Transactions)
- Query user balances
- Calculate totals (credited/debited)
- Connection pooling for performance
- Prepared statements for safety

### MongoDB (Members, Accounts, Tours)
- Store complex nested documents
- Member/account balance information
- Tour payment status
- Flexible schema for different data types

## Local LLM Benefits

✅ **Privacy**: All data stays local  
✅ **Offline**: Works without internet  
✅ **Cost**: Free (no API charges)  
✅ **Control**: Choose model size/speed  
✅ **Customization**: Fine-tune specific tasks  

## Scaling Considerations

### Phase 1: Current
- Single Ollama instance
- In-memory conversation history
- Direct database queries

### Phase 2: Vector DB Integration
- Add embeddings for semantic search
- Store transaction history as vectors
- Implement RAG (Retrieval-Augmented Generation)
- Improve answer quality with historical context

### Phase 3: Production Ready
- Multi-instance Ollama with load balancing
- Redis for distributed conversation cache
- Database query optimization & caching
- Rate limiting & authentication
- Monitoring & logging system
- A/B testing for different models

## Performance Metrics

### Expected Response Times
- Simple query (no tools): 2-5 seconds
- Tool-based query: 5-15 seconds
- Complex multi-tool query: 15-30 seconds

### Resource Usage (Llama2 7B)
- RAM: ~4-6GB
- CPU: 2-4 cores recommended
- GPU: Optional but recommended for speed

## Security Measures

Implemented:
- Environment variables for secrets
- Connection pooling defaults
- Parameter binding in SQL queries

Recommended additions:
- Input sanitization for chat messages
- Rate limiting on endpoints
- Authentication/authorization
- Audit logging for queries
- Prompt injection detection

## Extension Points

### Adding New Tools
1. Add tool definition to `src/tools/tools.ts`
2. Add case in `ToolsService.executeToolCall()`
3. Model will automatically use new tool

### Adding New Databases
1. Create service in `src/database/`
2. Add methods to ToolsService
3. Add tool definitions
4. Update system prompt if needed

### Using Different Models
1. Change `OLLAMA_MODEL` in `.env`
2. Available: llama2, mistral, neural-chat, sqlcoder, etc.
3. No code changes needed

### Custom LLM Providers
1. Create new service file (e.g., `src/llm/anthropic.service.ts`)
2. Implement same interface as OllamaService
3. Inject in ChatModule
4. All tools work with any LLM implementation

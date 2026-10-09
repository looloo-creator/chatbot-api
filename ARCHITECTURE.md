# Chatbot API Architecture

The Angular assistant calls the authenticated NestJS API. The API verifies the Looloo JWT, scopes each structured query and knowledge search to that user, and calls Ollama for embeddings and response generation.

## Request flow

1. `ChatAuthGuard` validates the signed-in user's JWT.
2. `OllamaService` embeds the question with `OLLAMA_EMBEDDING_MODEL` and retrieves matching rows from PostgreSQL/pgvector.
3. Llama receives the question, relevant knowledge, and available tool definitions.
4. `ToolsService` executes only user-scoped PostgreSQL queries for tour, member, and account data.
5. Retrieved records are returned to the model to write a concise answer.

Knowledge is indexed through authenticated `POST /chat/knowledge` calls. Records are private to their owner unless explicitly inserted with a null owner by an administrative process.

## Data storage

- PostgreSQL stores users, tours, tour members, accounts, and `assistant_knowledge`.
- pgvector stores 768-dimensional Ollama embeddings (`nomic-embed-text` by default).
- Llama is the response model; an embedding model is configured separately because generation models do not necessarily produce retrieval embeddings.
- Conversation history is currently in memory and is scoped by user and conversation ID.

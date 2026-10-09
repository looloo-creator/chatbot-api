# PostgreSQL and pgvector Retrieval

The RAG path is implemented in this API using PostgreSQL's pgvector extension and Ollama embeddings.

- Default embedding model: `nomic-embed-text` (768 dimensions).
- Add private knowledge using authenticated `POST /chat/knowledge` with `{ "content": "...", "title": "..." }`.
- Questions are embedded and matched with cosine distance; the retrieved text is added to Llama's prompt.
- Structured tour, member, and account totals continue to come from PostgreSQL tools, not semantic search.
- Apply migration `002_assistant_knowledge.sql` through `npm run db:migrate:rag` in `looloo-api` before using RAG.

The PostgreSQL server must have the pgvector extension available. The provided API Compose file uses the `pgvector/pgvector:pg16` image.

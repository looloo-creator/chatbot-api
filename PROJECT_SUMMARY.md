# Looloo Assistant API

The NestJS chatbot backend uses PostgreSQL as its only application database. Looloo operational data (users, tours, tour members, and accounts) is stored in PostgreSQL. Chat uses Ollama Llama for responses and a separate Ollama embedding model with pgvector for private knowledge retrieval.

## Useful commands

- `npm run start:dev` starts the API in watch mode.
- `npm run build` compiles the NestJS application.
- `npm run db:migrate` in `looloo-api` applies the core PostgreSQL schema.
- `npm run db:migrate:rag` applies pgvector RAG tables once the server has pgvector installed.
- `npm run db:import-mongo-json -- <export-folder>` in `looloo-api` imports legacy Mongo JSON exports after the schema has been applied.

See `README.md` for configuration and the authenticated chat endpoints. Existing Mongo records must be exported and imported before removing the old database files.

# Vector Database Integration Roadmap

This document outlines how to integrate a vector database for enhanced AI assistant capabilities.

## Current State (Phase 1)
- SQL + Tool Calling with Ollama
- Direct database queries
- Context limited to current conversation
- ✅ Production ready for basic queries

## Phase 2: Vector Database Integration

### What We'll Add
1. **Embeddings**: Convert text to vectors
2. **Vector Storage**: Store embeddings in vector DB
3. **Semantic Search**: Find similar queries/answers
4. **RAG (Retrieval-Augmented Generation)**: Improve answers with historical context

### Choice of Vector Databases

#### 1. **LanceDB** (Recommended for local development)
```bash
npm install lancedb
```
- ✅ Simple, lightweight, Python-based
- ✅ Works locally without external service
- ✅ Great for development/testing
- ❌ Limited scaling for production

```typescript
// Example integration
import { connect } from "lancedb";

const db = await connect("./data/vectors");
const table = await db.createTable("transactions", vectors);
const results = await table.search(queryVector).limit(5).toArray();
```

#### 2. **Weaviate** (Recommended for production)
```bash
docker run -d \
  -p 8080:8080 \
  cr.weaviate.io/semitechnologies/weaviate:latest
```
- ✅ Full-featured, open-source
- ✅ Scalable architecture
- ✅ Built-in ML models
- ✅ HNSW indexing for fast search

```typescript
// Example integration
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

const vectors = await client.graphql.get()
  .withClassName('Transaction')
  .withNearVector({ vector: queryVector })
  .withLimit(5)
  .do();
```

#### 3. **Pinecone** (Managed, simple)
```javascript
// API-based, no infrastructure needed
npm install @pinecone-database/pinecone
```
- ✅ Fully managed service
- ✅ Easy setup
- ✅ Excellent documentation
- ❌ Requires external service
- ❌ Costs money

#### 4. **Milvus** (Open-source, scalable)
```bash
docker run -d \
  --name milvus \
  -p 19530:19530 \
  milvusdb/milvus:latest
```
- ✅ Highly scalable
- ✅ Production-ready
- ✅ Low latency
- ❌ More complex setup

## Implementation Steps

### Step 1: Create Embedding Service

```typescript
// src/embeddings/embedding.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    // Use Ollama's embedding capability
    const response = await axios.post(
      `${process.env.OLLAMA_BASE_URL}/api/embeddings`,
      {
        model: 'nomic-embed-text', // or llama2
        prompt: text,
      }
    );
    return response.data.embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }
}
```

### Step 2: Create Vector Store Service

```typescript
// src/vector-store/vector-store.service.ts
import { Injectable } from '@nestjs/common';
import { connect } from 'lancedb'; // or your chosen DB

@Injectable()
export class VectorStoreService {
  private db;

  async initialize(): Promise<void> {
    this.db = await connect('./data/vectors');
    // Create tables for different data types
    // - transactions
    // - queries (past questions)
    // - answers (past responses)
  }

  async storeTransaction(
    id: string,
    transaction: any,
    embedding: number[]
  ): Promise<void> {
    const table = await this.db.openTable('transactions');
    await table.insert([
      {
        id,
        content: JSON.stringify(transaction),
        vector: embedding,
      },
    ]);
  }

  async searchSimilarTransactions(
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<any[]> {
    const table = await this.db.openTable('transactions');
    return table
      .search(queryEmbedding)
      .limit(limit)
      .toArray();
  }
}
```

### Step 3: Enhance Chat Service with Context

```typescript
// src/chat/chat-with-context.service.ts
@Injectable()
export class ChatWithContextService {
  constructor(
    private vectorStore: VectorStoreService,
    private embedding: EmbeddingService,
    private ollama: OllamaService,
  ) {}

  async chatWithContext(userMessage: string): Promise<string> {
    // 1. Generate embedding for user query
    const queryEmbedding = await this.embedding.generateEmbedding(userMessage);

    // 2. Search for similar past queries/transactions
    const relevantContext = 
      await this.vectorStore.searchSimilarTransactions(queryEmbedding, 3);

    // 3. Include context in system prompt
    const enhancedSystemPrompt = this.buildContextAwarePrompt(relevantContext);

    // 4. Send to LLM with context
    const response = await this.ollama.chatWithSystemPrompt(
      userMessage,
      enhancedSystemPrompt
    );

    // 5. Store the new query and response
    const responseEmbedding = 
      await this.embedding.generateEmbedding(response);
    
    await this.vectorStore.storeQuery(
      userMessage,
      response,
      responseEmbedding
    );

    return response;
  }

  private buildContextAwarePrompt(relevantContext: any[]): string {
    const contextStr = relevantContext
      .map(ctx => `Similar case: ${JSON.stringify(ctx)}`)
      .join('\n');

    return `You are an AI assistant for tour payment management.
      
Previous similar cases:
${contextStr}

Use this context to provide more accurate and consistent responses.`;
  }
}
```

### Step 4: Data Sync Strategy

```typescript
// src/sync/vector-sync.service.ts
@Injectable()
export class VectorSyncService {
  constructor(
    private vectorStore: VectorStoreService,
    private embedding: EmbeddingService,
    private postgres: PostgresService,
    private mongodb: MongodbService,
  ) {}

  // Run periodically (e.g., every hour)
  @Cron('0 * * * *')
  async syncUserTransactions(): Promise<void> {
    const users = await this.postgres.getAllUsers();

    for (const user of users) {
      const embedding = await this.embedding.generateEmbedding(
        `User: ${user.name}, Email: ${user.email}, Balance: ${user.balance}`
      );

      await this.vectorStore.storeUser(user.id, user, embedding);
    }

    console.log(`Synced ${users.length} users to vector DB`);
  }

  @Cron('0 * * * *')
  async syncMemberTransactions(): Promise<void> {
    const members = await this.mongodb.getAllMembers();

    for (const member of members) {
      const embedding = await this.embedding.generateEmbedding(
        `Member: ${member.name}, Balance: ${member.balance}`
      );

      await this.vectorStore.storeMember(member._id, member, embedding);
    }

    console.log(`Synced ${members.length} members to vector DB`);
  }
}
```

## Adding to docker-compose.yml

### For Weaviate:
```yaml
weaviate:
  image: semitechnologies/weaviate:latest
  container_name: looloo-weaviate
  ports:
    - "8080:8080"
  environment:
    QUERY_DEFAULTS_LIMIT: 100
    DEFAULT_VECTORIZER_MODULE: text2vec-contextionary
  networks:
    - looloo-network
```

### For LanceDB:
```yaml
# LanceDB runs locally, no container needed
# Just mount the data directory
volumes:
  - ./data/vectors:/app/data/vectors
```

## Models for Embeddings

### Using Ollama Embeddings:
```bash
# Pull embedding model
ollama pull nomic-embed-text

# Or use in LLM:
ollama pull sentence-transformers/all-MiniLM-L6-v2
```

### Embedding Model Comparison:
| Model | Size | Speed | Quality | Local |
|-------|------|-------|---------|-------|
| nomic-embed-text | 274M | Fast | Good | ✅ |
| all-MiniLM-L6-v2 | 22M | Very Fast | Good | ✅ |
| BGE-large | 438M | Medium | Best | ✅ |

## Testing Vector Search

```bash
# 1. Generate embedding for a query
curl -X POST http://localhost:11434/api/embeddings \
  -d '{
    "model": "nomic-embed-text",
    "prompt": "What is Johns balance?"
  }'

# 2. Store results
# 3. Search similar queries
```

## Performance Expectations

With Vector DB (Phase 2):
- Context-aware responses
- Faster responses for repeated questions (~50ms vs 5s)
- Better answer quality from historical context
- Ability to learn from past queries

## Migration Path

1. **Add Vector DB**: Don't remove current tool calling
2. **Parallel Storage**: Store embeddings alongside existing data
3. **Gradual Adoption**: Enable context for specific query types first
4. **A/B Testing**: Compare answers with/without context
5. **Full Migration**: Deprecate if vector approach performs better

## Configuration for Phase 2

```env
# Vector DB
VECTOR_DB=lancedb  # or weaviate, pinecone, milvus
VECTOR_DB_URL=./data/vectors

# Embeddings
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSION=768

# Sync
VECTOR_SYNC_INTERVAL=0 * * * *  # Every hour
```

## Next: Vector DB Deployment

Once you're ready to integrate, we'll create:
1. `src/embeddings/` - Embedding generation
2. `src/vector-store/` - Vector DB operations
3. `src/scheduler/` - Data sync tasks
4. Updated docker-compose with vector DB
5. Configuration and migration guide

**Ready to implement? Let me know which vector database you prefer!**

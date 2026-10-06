# Local LLM Selection Guide

Choose the best Ollama model for your use case.

## Quick Recommendations

| Use Case | Model | Memory | Speed | Accuracy |
|----------|-------|--------|-------|----------|
| **Best Balance** | mistral | 4GB | Fast | Excellent |
| **Best Quality** | llama2-13b | 8GB | Medium | Best |
| **Fastest** | neural-chat | 4GB | Very Fast | Good |
| **SQL Tasks** | sqlcoder | 4GB | Fast | Excellent |
| **Resource Constrained** | mistral-7b | 3GB | Fast | Good |
| **Multi-language** | llama2-13b | 8GB | Medium | Excellent |

## Detailed Model Comparison

### 1. **Mistral 7B** ⭐ RECOMMENDED for this project
```bash
ollama pull mistral
```
- **Memory**: 4GB
- **Speed**: Very Fast (5-10s per query)
- **Strengths**: 
  - Good at following instructions
  - Better coding abilities than Llama2
  - Efficient reasoning
  - ~30% faster than Llama2-7b
- **Best for**: General queries, balance inquiries, tool calling
- **Performance**: 2-5 queries/second on 2-core CPU

**Start here for best experience!**

### 2. **Llama2 7B**
```bash
ollama pull llama2
```
- **Memory**: 4GB
- **Speed**: Medium (8-15s per query)
- **Strengths**:
  - Most popular LLM
  - Good general purpose
  - Well-tested with tools
  - Lots of documentation
- **Best for**: General-purpose queries
- **Note**: Older than Mistral, but proven

### 3. **Llama2 13B**
```bash
ollama pull llama2:13b
```
- **Memory**: 8GB
- **Speed**: Slower (10-20s per query)
- **Strengths**:
  - Better reasoning
  - More accurate answers
  - Better at complex tasks
- **Best for**: Complex balance sheet queries, analysis
- **Recommended**: If you have 8GB+ RAM and want best answers

### 4. **Neural Chat 7B**
```bash
ollama pull neural-chat
```
- **Memory**: 4GB
- **Speed**: Fastest (4-8s per query)
- **Strengths**:
  - Specialized for chat
  - Very fast responses
  - Good conversational ability
- **Weakness**: May struggle with tasks
- **Best for**: Conversational chatbots

### 5. **SQLCoder** (For SQL-Heavy Queries)
```bash
ollama pull sqlcoder
```
- **Memory**: 4GB
- **Speed**: Fast (6-12s per query)
- **Strengths**:
  - Specialized for SQL generation
  - Excellent at database queries
  - Can write complex SQL
- **Best for**: Balance queries (uses SQL tools)
- **Note**: Specialized, might need fallback for general chat

### 6. **Zephyr** (Latest and Greatest)
```bash
ollama pull zephyr
```
- **Memory**: 4GB
- **Speed**: Medium-Fast (6-12s per query)
- **Strengths**:
  - Based on Mistral
  - Better instruction following
  - Improved reasoning
- **Best for**: If you want cutting edge
- **Status**: Newer, less tested in production

### 7. **OpenHermes** (Balanced)
```bash
ollama pull openhermes
```
- **Memory**: 4GB  
- **Speed**: Fast (5-10s per query)
- **Strengths**:
  - Good all-rounder
  - Better than Llama2 at reasoning
  - Open source variant
- **Best for**: General purpose

## Feature Comparison Matrix

| Model | Reasoning | Coding | Speed | Money | SQL | Tools |
|-------|-----------|--------|-------|-------|-----|-------|
| Mistral | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Llama2-7b | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Llama2-13b | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Neural Chat | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| SQLCoder | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Zephyr | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Hardware Requirements

### Minimum (Works but slow)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Type**: Suitable for development/testing
- **Models**: mistral-7b, neural-chat

### Recommended
- **CPU**: 4 cores
- **RAM**: 8GB
- **GPU**: Optional (2GB VRAM helps)
- **Type**: Good for production
- **Models**: mistral, llama2-7b, zephyr

### Optimal
- **CPU**: 8+ cores
- **RAM**: 16GB
- **GPU**: NVIDIA GPU (8GB VRAM+)
- **Type**: Best performance
- **Models**: llama2-13b, larger models
- **Performance**: 10-20 queries/second

## Performance Benchmarks (Per Query)

### On 4-Core CPU, 8GB RAM:

```
Model                | Time    | Quality | Best For
--------------------|---------|---------|-------------------
mistral-7b          | 6-8s    | ⭐⭐⭐⭐ | 🏆 RECOMMENDED
neural-chat-7b      | 5-6s    | ⭐⭐⭐  | Fast chat
llama2-7b           | 8-10s   | ⭐⭐⭐  | General purpose
zephyr-7b           | 7-9s    | ⭐⭐⭐⭐ | Latest
sqlcoder-7b         | 7-9s    | ⭐⭐⭐⭐ | SQL queries
llama2-13b          | 12-15s  | ⭐⭐⭐⭐⭐ | Complex tasks
```

## How to Switch Models

### 1. Pull the model
```bash
ollama pull <model-name>
```

### 2. Update .env
```env
OLLAMA_MODEL=mistral
# or any other model name
```

### 3. Restart the application
```bash
npm run start:dev
```

That's it! No code changes needed.

## Model-Specific Tips

### For Mistral (RECOMMENDED)
```env
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
```
- Best for tool calling
- Excellent at following instruction format
- Recommended for production

### For SQLCoder
```env
OLLAMA_MODEL=sqlcoder
```
- Modify system prompt to emphasize SQL generation
- Use `search_user_by_name` tool more
- Excellent for database queries

### For Llama2 13B (Best Quality)
```env
OLLAMA_MODEL=llama2:13b
```
- Needs more memory (8GB+)
- Better reasoning for complex queries
- Worth the extra time

## Testing Different Models

### Quick test script:
```bash
# Test mistral
OLLAMA_MODEL=mistral npm run start:dev
# Send query, check response time, quality

# Test neural-chat  
OLLAMA_MODEL=neural-chat npm run start:dev
# Send same query, compare

# Test llama2
OLLAMA_MODEL=llama2 npm run start:dev
# Send same query, compare
```

## Installation Notes

### First Time Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama (runs in background)
ollama serve &

# Pull your model
ollama pull mistral

# Verify it's working
curl http://localhost:11434/api/tags
```

### Updating Models
```bash
# Remove old model
ollama rm mistral

# Pull new version
ollama pull mistral

# Will pull latest by default
```

## Production Recommendations

**For your tour payment management chatbot:**

1. **Start with Mistral**
   - Best balance of speed and quality
   - Works great with tool calling
   - 4GB memory footprint

2. **If you have space, add SQLCoder**
   - Perfect for database queries
   - Fall back to Mistral for general chat
   - Can implement in one function

3. **Monitor response times**
   - Track query latencies
   - Adjust model if needed
   - Users typically accept 5-10s response

## Troubleshooting

### Model loads slowly
- More RAM needed, try smaller model
- Close other applications
- Check CPU usage: `top` or `Activity Monitor`

### Out of memory
```bash
# Free up model from memory
ollama kill
# Run with smaller model
ollama pull mistral
ollama serve
```

### Model not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, restart
ollama serve
```

## Summary

**Quick Decision Tree:**

```
Do you care most about speed?
  ├─ Yes → neural-chat, mistral
  └─ No → Go to next question

Do you need best accuracy?
  ├─ Yes → llama2-13b
  └─ No → Go to next question

Do you have 8GB+ RAM?
  ├─ Yes → llama2-13b or mistral
  └─ No → mistral-7b or neural-chat

For SQL queries specifically?
  ├─ Yes → sqlcoder
  └─ No → mistral (default)
```

**🎯 Final recommendation: Start with `mistral` then adjust based on your needs!**

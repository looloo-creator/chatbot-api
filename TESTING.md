# API Testing - cURL Examples

## 1. Health Check
```bash
curl -X GET http://localhost:3001/chat/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Ollama is running and accessible"
}
```

## 2. Send a Simple Message
```bash
curl -X POST http://localhost:3001/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you help me with?"}'
```

## 3. Query User Balance
```bash
curl -X POST http://localhost:3001/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the balance for user ID 5?"}'
```

## 4. Get All Users Balances
```bash
curl -X POST http://localhost:3001/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all users and their balances"}'
```

## 5. Search User by Name
```bash
curl -X POST http://localhost:3001/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is John Doe balance?"}'
```

## 6. Get Conversation History
```bash
curl -X GET http://localhost:3001/chat/history
```

## 7. Clear Conversation
```bash
curl -X POST http://localhost:3001/chat/clear
```

## JavaScript/Fetch Examples

### Send Message
```javascript
const message = "What is user 5 balance?";

fetch('http://localhost:3001/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Get History
```javascript
fetch('http://localhost:3001/chat/history')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Expected Response Format

```json
{
  "success": true,
  "response": "User John Doe with ID 5 has a current balance of $1,250.50. They have been credited $5,000.00 and debited $3,749.50.",
  "toolResults": [
    {
      "tool": "get_user_balance",
      "result": [
        {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com",
          "total_credited": 5000.00,
          "total_debited": 3749.50,
          "balance": 1250.50
        }
      ]
    }
  ]
}
```

## Debugging

### Enable verbose logging (add to .env)
```
DEBUG=*
LOG_LEVEL=debug
```

### Check Ollama status
```bash
curl http://localhost:11434/api/tags
```

### Check if specific model is available
```bash
curl http://localhost:11434/api/tags | grep llama2
```

### Test Ollama directly
```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

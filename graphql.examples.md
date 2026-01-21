# GraphQL API Examples

Test these queries/mutations at: **http://localhost:3000/graphql**

## 🔐 Authentication Mutations

### 1. Register User

```graphql
mutation Register {
  register(
    email: "test@example.com"
    username: "testuser"
    password: "password123"
  ) {
    success
    message
    user {
      id
      email
      username
      createdAt
    }
    accessToken
    refreshToken
  }
}
```

### 2. Login

```graphql
mutation Login {
  login(
    email: "user1@test.com"
    password: "password123"
  ) {
    success
    message
    user {
      id
      email
      username
    }
    accessToken
    refreshToken
  }
}
```

### 3. Get Current User (Requires Auth)

**Add HTTP Header:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

```graphql
query Me {
  me {
    id
    email
    username
    createdAt
    updatedAt
  }
}
```

### 4. Logout (Requires Auth)

```graphql
mutation Logout {
  logout {
    success
    message
  }
}
```

## 💬 Chat Mutations & Queries

### 5. Send Message (Create New Thread)

**Add HTTP Header:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

```graphql
mutation SendMessage {
  sendMessage(
    content: "Hello! How can you help me today?"
  ) {
    success
    message
    threadId
    aiMessage
    usage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}
```

### 6. Send Message (Existing Thread)

```graphql
mutation SendMessageToThread {
  sendMessage(
    content: "Tell me more about that"
    threadId: "YOUR_THREAD_ID"
  ) {
    success
    message
    threadId
    aiMessage
    usage {
      totalTokens
    }
  }
}
```

### 7. Get All Threads

```graphql
query GetThreads {
  threads {
    success
    threads {
      id
      title
      latestMessage
      createdAt
      updatedAt
    }
  }
}
```

### 8. Get Specific Thread with Messages

```graphql
query GetThread {
  thread(threadId: "YOUR_THREAD_ID") {
    success
    thread {
      id
      title
      latestMessage
      createdAt
      updatedAt
      messages {
        id
        content
        sender
        createdAt
      }
    }
  }
}
```

### 9. Delete Thread

```graphql
mutation DeleteThread {
  deleteThread(threadId: "YOUR_THREAD_ID") {
    success
    message
  }
}
```

## 🧪 Testing Flow

1. **Register** → Get `accessToken`
2. **Set Authorization Header** → `Bearer YOUR_ACCESS_TOKEN`
3. **Send Message** → Get `threadId` and AI response
4. **Get Threads** → See all conversations
5. **Get Thread** → See specific conversation with messages
6. **Delete Thread** → Clean up

## 📝 Notes

- All chat queries/mutations require authentication (Authorization header)
- Authentication mutations (register/login) are public
- Tokens expire after 15 minutes (access) / 7 days (refresh)

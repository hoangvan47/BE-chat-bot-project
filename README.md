# 🔥 Chat Bot Backend - GraphQL API

TypeScript + GraphQL + MongoDB + OpenAI backend API.

## 🚀 Tech Stack

- **TypeScript** - Type-safe programming
- **Apollo Server Express** - GraphQL server
- **Express.js v4** - Web framework  
- **MongoDB** - NoSQL database with Prisma ORM
- **Prisma** - Type-safe ORM
- **OpenAI API** - GPT-4o-mini
- **JWT** - Authentication
- **GraphQL** - With pagination

---

## 📁 Structure

```
backend/
├── src/
│   ├── graphql/
│   │   ├── schemas/       # Type definitions
│   │   ├── resolvers/     # Business logic + Pagination
│   │   ├── context.ts     # JWT auth context
│   │   └── types.ts       # TypeScript types
│   ├── utils/             # JWT, OpenAI utilities
│   ├── config/            # Database connection
│   ├── app.ts             # Express + Apollo setup
│   └── server.ts          # Entry point
├── prisma/
│   ├── schema.prisma      # MongoDB schema
│   └── seed.ts            # Mock users
├── docker-compose.yml     # MongoDB container
└── ENV_TEMPLATE.txt       # Environment template
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js v22+ (recommended)
- Yarn package manager
- Docker & Docker Compose
- OpenAI API key

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Environment

```bash
# Copy template
cp ENV_TEMPLATE.txt .env

# Edit .env - UPDATE THESE:
# OPENAI_API_KEY="sk-proj-YOUR-KEY"
# JWT_ACCESS_SECRET="your-secret"
# JWT_REFRESH_SECRET="your-refresh-secret"
```

### 3. Start MongoDB

```bash
# Start MongoDB with Replica Set
docker-compose up -d

# Wait 10 seconds
sleep 10

# Initialize Replica Set (IMPORTANT!)
docker exec chat-bot-mongodb mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"

# Verify
docker ps | grep mongodb
```

### 4. Setup Database

```bash
# Generate Prisma Client
yarn prisma:generate

# Push schema to MongoDB
yarn prisma:push

# Seed mock users
yarn prisma:seed
```

### 5. Start Server

```bash
# Development
yarn dev

# Production
yarn build
yarn start
```

**Server:** http://localhost:3000

**GraphQL:** http://localhost:3000/graphql

---

## 📝 Environment Variables

`ENV_TEMPLATE.txt` → `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection | `mongodb://localhost:27017/chat_bot_db?replicaSet=rs0` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `JWT_ACCESS_SECRET` | Access token secret | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-key` |
| `JWT_ACCESS_EXPIRATION` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

---

## 🎯 GraphQL API

### Authentication (Public)

**Register:**
```graphql
mutation {
  register(email: "test@example.com", username: "testuser", password: "password123") {
    success
    user { id, username, email }
    accessToken
  }
}
```

**Login:**
```graphql
mutation {
  login(email: "user1@test.com", password: "password123") {
    success
    accessToken
  }
}
```

### Chat (Protected)

**HTTP Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Send Message:**
```graphql
mutation {
  sendMessage(content: "Hello!") {
    success
    threadId
    aiMessage
  }
}
```

**Get Threads (Pagination):**
```graphql
query {
  threads(page: 1, limit: 10) {
    success
    threads { id, title, latestMessage }
    pageInfo {
      total
      hasNextPage
      hasPreviousPage
    }
  }
}
```

See `graphql.examples.md` for more!

---

## 🔐 Mock Users

| Email | Password |
|-------|----------|
| user1@test.com | password123 |
| admin@test.com | password123 |
| user2@test.com | password123 |

---

## 📦 Scripts

```bash
yarn dev              # Development server (ts-node-dev)
yarn build            # Build TypeScript → dist/
yarn start            # Run production build
yarn prisma:generate  # Generate Prisma Client
yarn prisma:push      # Push schema to MongoDB
yarn prisma:seed      # Seed mock users
```

---

## 🐳 Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker logs chat-bot-mongodb

# Remove (with data)
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Port 3000 in use?

```bash
lsof -ti:3000 | xargs kill -9
```

### MongoDB connection failed?

```bash
# Check container
docker ps | grep mongodb

# Restart
docker-compose restart

# Re-init replica set
docker exec chat-bot-mongodb mongosh --eval "rs.initiate(...)"
```

### Prisma errors?

```bash
yarn prisma:generate
yarn prisma:push
```

---

## 📊 Database (MongoDB)

**Connection:** `mongodb://localhost:27017/chat_bot_db`

**Collections:**
- `users` - User accounts
- `threads` - Chat conversations
- `messages` - All messages (user + AI)

**View in:** TablePlus, MongoDB Compass

---

## 🚀 Deploy

### Railway

```bash
railway login
railway init
railway up
```

**Environment Variables:**
- `DATABASE_URL` - MongoDB Atlas connection
- `OPENAI_API_KEY` - Your key
- `JWT_ACCESS_SECRET` - Strong random key
- `JWT_REFRESH_SECRET` - Strong random key

### Render/Heroku

Same environment variables required.

---

**Built with ❤️ using TypeScript + GraphQL**
# BE-chat-bot-project

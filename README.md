# 🔥 Chat Bot Backend - GraphQL API

TypeScript + GraphQL + MongoDB + OpenAI + Cloudinary backend API.

## 🚀 Tech Stack

- **TypeScript** - Type-safe programming
- **Apollo Server Express** - GraphQL server
- **Express.js v4** - Web framework  
- **MongoDB** - NoSQL database with Prisma ORM
- **Prisma** - Type-safe ORM
- **OpenAI API** - GPT-4o-mini
- **Cloudinary** - Image storage & CDN
- **JWT** - Authentication
- **GraphQL** - With pagination

---

## ⚡ Quick Start

### Prerequisites

- Node.js v22+ (recommended)
- Yarn package manager
- Docker & Docker Compose
- OpenAI API key
- Cloudinary account (optional, for image uploads)

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env - UPDATE THESE:
```

**Required:**
```env
OPENAI_API_KEY="sk-proj-YOUR-ACTUAL-KEY"
JWT_ACCESS_SECRET="generate-strong-random-secret-here"
JWT_REFRESH_SECRET="generate-different-strong-secret-here"
```

**Optional (for image uploads):**
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Generate strong secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start MongoDB

```bash
# Start MongoDB with Replica Set
docker-compose up -d

# Wait 10 seconds
sleep 10

# Initialize Replica Set (ONE TIME ONLY)
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

### 5. Start Development Server

```bash
yarn dev
```

**Server:** http://localhost:3000

**GraphQL Playground:** http://localhost:3000/graphql

---

## 📝 Environment Variables (.env)

Based on `.env.example`:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MongoDB connection | ✅ Yes | `mongodb://localhost:27017/chat_bot_db?replicaSet=rs0` |
| `JWT_ACCESS_SECRET` | Access token secret | ✅ Yes | `<64-char-random-hex>` |
| `JWT_REFRESH_SECRET` | Refresh token secret | ✅ Yes | `<64-char-random-hex>` |
| `JWT_ACCESS_EXPIRATION` | Access token lifetime | ✅ Yes | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime | ✅ Yes | `7d` |
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | `sk-proj-...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ⚪ Optional | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ⚪ Optional | `123456...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ⚪ Optional | `abcd...` |
| `PORT` | Server port | ✅ Yes | `3000` |
| `NODE_ENV` | Environment | ✅ Yes | `development` |

---

## 🎯 GraphQL API

### Mutations (Authentication)

**Register:**
```graphql
mutation {
  register(email: "test@example.com", username: "testuser", password: "password123") {
    success
    user { id, username }
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

### Mutations (Chat)

**Send Message (with optional image):**
```graphql
mutation {
  sendMessage(
    content: "Hello!", 
    threadId: "optional-thread-id",
    imageUrl: "https://res.cloudinary.com/your-cloud/image.jpg"
  ) {
    success
    threadId
    aiMessage
  }
}
```

### Queries (Chat - Protected)

**Get Threads (Pagination):**
```graphql
query {
  threads(page: 1, limit: 10) {
    threads { id, title, latestMessage }
    pageInfo { total, hasNextPage }
  }
}
```

See `graphql.examples.md` for more!

---

## 🔐 Mock Users

After seeding:

| Email | Password |
|-------|----------|
| user1@test.com | password123 |
| admin@test.com | password123 |
| user2@test.com | password123 |

---

## 📦 Scripts

```bash
yarn dev              # Development (ts-node-dev)
yarn build            # Build TypeScript → dist/
yarn start            # Production server
yarn prisma:generate  # Generate Prisma Client
yarn prisma:push      # Push schema to MongoDB
yarn prisma:seed      # Seed mock users
```

---

## 🐳 Docker Commands

```bash
# Start MongoDB
docker-compose up -d

# Stop
docker-compose down

# View logs
docker logs chat-bot-mongodb

# Restart
docker-compose restart

# Remove all (including data)
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
docker ps | grep mongodb
docker-compose restart
```

### Prisma errors?
```bash
yarn prisma:generate
yarn prisma:push
```

---

## 🚀 Deploy to Production

### Environment Variables (Production)

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/chat_bot_db"
OPENAI_API_KEY="sk-proj-your-production-key"
JWT_ACCESS_SECRET="<strong-random-secret-64-chars>"
JWT_REFRESH_SECRET="<different-strong-secret-64-chars>"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
NODE_ENV=production
PORT=3000
```

### Deploy to Railway/Render

1. Push code to Git
2. Connect repo
3. Add environment variables
4. Deploy!

---

## 📚 Documentation

- **GraphQL Examples:** `graphql.examples.md`
- **Security Review:** `SECURITY_REVIEW.md`
- **Cloudinary Setup:** `../CLOUDINARY_SETUP.md`

---

**Built with ❤️ using TypeScript + GraphQL + MongoDB**

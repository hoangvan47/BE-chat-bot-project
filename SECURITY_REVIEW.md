# 🔒 Security & Clean Code Review - Backend

## 🛡️ Security Vulnerabilities & Fixes

### ⚠️ CRITICAL - Must Fix Before Production

#### 1. JWT Secrets in Code
**Issue:** JWT secrets are hardcoded in ENV_TEMPLATE.txt
```env
JWT_ACCESS_SECRET="your-super-secret-access-key"
```

**Risk:** 🔴 HIGH - Anyone can decode tokens

**Fix:**
```bash
# Generate strong random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env với generated secrets
JWT_ACCESS_SECRET="<generated-64-char-hex>"
JWT_REFRESH_SECRET="<different-64-char-hex>"
```

#### 2. MongoDB Without Authentication
**Issue:** MongoDB running without username/password
```yaml
# docker-compose.yml - NO AUTH!
mongodb:
  image: mongo:7.0
```

**Risk:** 🔴 HIGH - Anyone can access database

**Fix:**
```yaml
mongodb:
  image: mongo:7.0
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
```

```env
# .env
DATABASE_URL="mongodb://admin:${MONGODB_PASSWORD}@localhost:27017/chat_bot_db?authSource=admin&replicaSet=rs0"
```

#### 3. OpenAI API Key Exposure
**Issue:** API key trong .env có thể bị commit

**Risk:** 🟡 MEDIUM - API key leaked

**Fix:**
```bash
# .gitignore (already added)
.env
.env.local
.env.*.local

# Use environment variables service:
# - Railway Secrets
# - Render Environment Variables
# - AWS Secrets Manager
```

#### 4. CORS Too Permissive
**Issue:** CORS allows localhost only
```typescript
cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
})
```

**Risk:** 🟡 MEDIUM - Need production domains

**Fix:**
```typescript
cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.com']
    : ['http://localhost:5173'],
  credentials: true,
})
```

#### 5. No Rate Limiting
**Issue:** No protection against brute force attacks

**Risk:** 🟡 MEDIUM - API abuse

**Fix:**
```bash
yarn add express-rate-limit

# In app.ts:
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
});

app.use('/graphql', limiter);
```

#### 6. Password Hashing Salt Rounds
**Issue:** bcrypt salt rounds = 10 (acceptable but can be higher)

**Risk:** 🟢 LOW - Can be improved

**Fix:**
```typescript
// Increase to 12 for better security
const hashedPassword = await bcrypt.hash(password, 12);
```

### ⚠️ MEDIUM - Should Fix

#### 7. No Request Validation
**Issue:** GraphQL inputs not sanitized

**Risk:** 🟡 MEDIUM - XSS, SQL injection (NoSQL)

**Fix:**
```bash
yarn add validator

# In resolvers:
import validator from 'validator';

if (!validator.isEmail(email)) {
  throw new Error('Invalid email');
}

const sanitized = validator.escape(content);
```

#### 8. No Input Length Limits
**Issue:** Users can send very long messages

**Risk:** 🟡 MEDIUM - DOS, storage abuse

**Fix:**
```typescript
// In chat.resolvers.ts:
if (content.length > 5000) {
  throw new Error('Message too long (max 5000 characters)');
}
```

#### 9. Error Messages Too Verbose
**Issue:** Errors expose internal details
```typescript
console.error('GraphQL Error:', error); // Logs to client
```

**Risk:** 🟡 MEDIUM - Information disclosure

**Fix:**
```typescript
formatError: (error) => {
  console.error('Internal error:', error); // Log server-side only
  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message,
  };
}
```

#### 10. No MongoDB Injection Protection
**Issue:** User input directly in queries

**Risk:** 🟡 MEDIUM - NoSQL injection

**Fix:**
```typescript
// Prisma already protects against injection
// But validate inputs:
if (typeof threadId !== 'string' || !threadId.match(/^[a-f0-9]{24}$/)) {
  throw new Error('Invalid thread ID');
}
```

### ℹ️ LOW - Nice to Have

#### 11. No Request Logging
**Issue:** No audit trail

**Fix:**
```bash
yarn add morgan

import morgan from 'morgan';
app.use(morgan('combined'));
```

#### 12. No HTTPS Redirect
**Issue:** No automatic HTTPS redirect

**Fix:**
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 🧹 Clean Code Issues

### 1. Inconsistent Error Handling
**Issue:** Some functions throw, some return error objects

**Fix:** Standardize error handling:
```typescript
// Always throw errors in resolvers
throw new GraphQLError('User not found', {
  extensions: { code: 'NOT_FOUND' },
});
```

### 2. Magic Numbers
**Issue:** Hardcoded values scattered
```typescript
max_tokens: 500,  // What is 500?
temperature: 0.7, // Why 0.7?
```

**Fix:**
```typescript
// config/constants.ts
export const OPENAI_CONFIG = {
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  MODEL: 'gpt-4o-mini',
} as const;
```

### 3. Duplicate Code
**Issue:** Token generation logic duplicated

**Fix:** Extract to utility function

### 4. No Input DTOs
**Issue:** Resolver args not typed properly

**Fix:**
```typescript
interface SendMessageInput {
  content: string;
  threadId?: string;
}

sendMessage: async (_parent, args: SendMessageInput, context) => { ... }
```

### 5. No Logging Service
**Issue:** console.log everywhere

**Fix:**
```bash
yarn add winston

# Create logger service
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'error.log' })],
});
```

---

## 📋 Security Checklist

### Before Production:

- [ ] Generate strong JWT secrets
- [ ] Add MongoDB authentication
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Sanitize all inputs
- [ ] Add input length limits
- [ ] Update CORS for production domains
- [ ] Remove verbose error messages
- [ ] Add HTTPS redirect
- [ ] Add request logging
- [ ] Review all dependencies for vulnerabilities (`yarn audit`)
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB encryption at rest
- [ ] Add API monitoring (Sentry, DataDog)
- [ ] Implement request timeout
- [ ] Add health check endpoint

---

## 🛡️ Best Practices Implemented

✅ **Already Good:**
- TypeScript throughout
- JWT authentication
- Password hashing (bcrypt)
- Prisma ORM (prevents SQL/NoSQL injection)
- Environment variables for secrets
- .gitignore for sensitive files
- Error handling in resolvers
- GraphQL type safety

---

## 📚 Recommended Packages

### Security:
```bash
yarn add express-rate-limit      # Rate limiting
yarn add helmet                  # Security headers
yarn add validator               # Input validation
yarn add express-mongo-sanitize  # NoSQL injection protection
```

### Logging:
```bash
yarn add winston                 # Logging service
yarn add morgan                  # HTTP request logger
```

### Monitoring:
```bash
yarn add @sentry/node            # Error tracking
```

---

**🔒 Review this document before deploying to production!**

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schemas';
import { resolvers } from './graphql/resolvers';
import { context } from './graphql/context';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ==================== APOLLO SERVER SETUP ====================
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => context({ req }),
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  },
  introspection: true, // Enable GraphQL Playground
  playground: true,
});

// Export both app and apolloServer for server.ts
export { app, apolloServer };

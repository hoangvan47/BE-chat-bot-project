import { app, apolloServer } from './app';
import cors from 'cors';
import express from 'express';
import prisma from './config/database';

const PORT = process.env.PORT || 3000;

/**
 * Start Apollo Server and Express Server
 */
async function startServer(): Promise<void> {
  try {
    // Apply middlewares
    app.use(
      cors({
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://studio.apollographql.com', // Apollo Studio Sandbox
        ],
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Root route
    app.get('/', (req, res) => {
      res.json({
        message: 'Chat Bot GraphQL API - TypeScript + MongoDB',
        version: '3.0.0',
        graphql: '/graphql',
        technology: 'Apollo Server + Express + MongoDB + TypeScript',
      });
    });

    // Apply Apollo Server middleware
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    console.log('✅ Apollo Server started');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🎯 GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log(`🗄️  Database: MongoDB with Replica Set`);
      console.log(`💻 Language: TypeScript`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📝 Ready to accept GraphQL requests!');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await apolloServer.stop();
        await prisma.$disconnect();
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

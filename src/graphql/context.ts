import { Request } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import prisma from '../config/database';
import { GraphQLContext } from './types';

interface ContextParams {
  req: Request;
}

/**
 * GraphQL Context Function
 * Extracts user from JWT token and adds to context
 * This allows all resolvers to access authenticated user
 */
export const context = async ({ req }: ContextParams): Promise<GraphQLContext> => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        refreshToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { user: null };
    }

    // Return user in context
    return { user };
  } catch (error: any) {
    console.error('Context auth error:', error.message);
    return { user: null };
  }
};

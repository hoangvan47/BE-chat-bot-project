import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.util';
import { GraphQLContext, AuthResponse, Response } from '../types';

/**
 * GraphQL Resolvers: Authentication
 * Business logic for auth queries and mutations
 */

interface RegisterArgs {
  email: string;
  username: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

export const authResolvers = {
  Query: {
    /**
     * Get current logged-in user profile
     * Requires authentication (user from context)
     */
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },
  },

  Mutation: {
    /**
     * Register new user
     */
    register: async (_parent: any, args: RegisterArgs): Promise<AuthResponse> => {
      try {
        const { email, username, password } = args;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });

        if (existingUser) {
          return {
            success: false,
            message: 'User with this email or username already exists',
            user: null,
            accessToken: null,
            refreshToken: null,
          };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            username,
            password: hashedPassword,
          },
        });

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Save hashed refresh token to database
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: hashedRefreshToken },
        });

        return {
          success: true,
          message: 'User registered successfully',
          user,
          accessToken,
          refreshToken,
        };
      } catch (error) {
        console.error('Register error:', error);
        throw new Error('Failed to register user');
      }
    },

    /**
     * Login user
     */
    login: async (_parent: any, args: LoginArgs): Promise<AuthResponse> => {
      try {
        const { email, password } = args;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return {
            success: false,
            message: 'Invalid credentials',
            user: null,
            accessToken: null,
            refreshToken: null,
          };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid credentials',
            user: null,
            accessToken: null,
            refreshToken: null,
          };
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Save hashed refresh token to database
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: hashedRefreshToken },
        });

        return {
          success: true,
          message: 'Login successful',
          user,
          accessToken,
          refreshToken,
        };
      } catch (error) {
        console.error('Login error:', error);
        throw new Error('Failed to login');
      }
    },

    /**
     * Logout user
     */
    logout: async (_parent: any, _args: any, context: GraphQLContext): Promise<Response> => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Remove refresh token from database
        await prisma.user.update({
          where: { id: context.user.id },
          data: { refreshToken: null },
        });

        return {
          success: true,
          message: 'Logout successful',
        };
      } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
      }
    },
  },
};

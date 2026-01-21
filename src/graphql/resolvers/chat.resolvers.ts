import OpenAI from 'openai';
import prisma from '../../config/database';
import { generateAIMessages } from '../../utils/openai.util';
import { GraphQLContext, ChatResponse, ThreadsResponse, ThreadResponse, DeleteResponse } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GraphQL Resolvers: Chat
 * Business logic for chat queries and mutations
 */

interface SendMessageArgs {
  content: string;
  threadId?: string;
}

interface ThreadArgs {
  threadId: string;
}

interface DeleteThreadArgs {
  threadId: string;
}

interface ThreadsArgs {
  page?: number;
  limit?: number;
}

export const chatResolvers = {
  Query: {
    /**
     * Get all threads for current user with pagination
     */
    threads: async (_parent: any, args: ThreadsArgs, context: GraphQLContext): Promise<ThreadsResponse> => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const page = args.page || 1;
        const limit = args.limit || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const total = await prisma.thread.count({
          where: { userId: context.user.id },
        });

        // Get paginated threads
        const threads = await prisma.thread.findMany({
          where: { userId: context.user.id },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            latestMessage: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          success: true,
          threads: threads.map((thread) => ({
            ...thread,
            createdAt: thread.createdAt.toISOString(),
            updatedAt: thread.updatedAt.toISOString(),
          })),
          pageInfo: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        console.error('Get threads error:', error);
        throw new Error('Failed to get threads');
      }
    },

    /**
     * Get specific thread by ID
     */
    thread: async (_parent: any, args: ThreadArgs, context: GraphQLContext): Promise<ThreadResponse> => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const { threadId } = args;

        const thread = await prisma.thread.findFirst({
          where: {
            id: threadId,
            userId: context.user.id,
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (!thread) {
          return {
            success: false,
            thread: null,
          };
        }

        return {
          success: true,
          thread: {
            ...thread,
            createdAt: thread.createdAt.toISOString(),
            updatedAt: thread.updatedAt.toISOString(),
            messages: thread.messages.map((msg) => ({
              ...msg,
              createdAt: msg.createdAt.toISOString(),
            })),
          },
        };
      } catch (error) {
        console.error('Get thread error:', error);
        throw new Error('Failed to get thread');
      }
    },
  },

  Mutation: {
    /**
     * Send message and get AI response
     */
    sendMessage: async (_parent: any, args: SendMessageArgs, context: GraphQLContext): Promise<ChatResponse> => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const { content, threadId } = args;
        const userId = context.user.id;

        // Validate input
        if (!content || content.trim() === '') {
          throw new Error('Message content is required');
        }

        // Get or create thread
        let thread;
        if (threadId) {
          thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
          });

          if (!thread || thread.userId !== userId) {
            throw new Error('Thread not found');
          }
        } else {
          // Create new thread
          thread = await prisma.thread.create({
            data: {
              userId,
              title: content.substring(0, 50), // Use first 50 chars as title
            },
            include: { messages: true },
          });
        }

        // Prepare conversation history for OpenAI
        const conversationHistory = thread.messages.map((msg) => ({
          role: msg.sender as 'user' | 'assistant',
          content: msg.content,
        }));

        // Add current user message
        conversationHistory.push({
          role: 'user' as const,
          content,
        });

        // Generate AI messages with context (REUSE from document)
        const aiMessages = generateAIMessages({
          messages: conversationHistory,
          recentMessageCount: 4,
          systemPrompt:
            'You are a helpful AI assistant for template.net. Provide concise, accurate, and friendly responses.',
        });

        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: aiMessages as any,
          max_tokens: 500,
          temperature: 0.7,
        });

        const aiResponse = response.choices[0].message.content || '';

        // Save user message to database
        await prisma.message.create({
          data: {
            threadId: thread.id,
            content,
            sender: 'user',
          },
        });

        // Save AI message to database
        await prisma.message.create({
          data: {
            threadId: thread.id,
            content: aiResponse,
            sender: 'assistant',
          },
        });

        // Update thread's latest message
        await prisma.thread.update({
          where: { id: thread.id },
          data: { latestMessage: aiResponse },
        });

        return {
          success: true,
          message: 'Message sent successfully',
          threadId: thread.id,
          aiMessage: aiResponse,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };
      } catch (error: any) {
        console.error('Send message error:', error);
        throw new Error(error.message || 'Failed to send message');
      }
    },

    /**
     * Delete thread
     */
    deleteThread: async (_parent: any, args: DeleteThreadArgs, context: GraphQLContext): Promise<DeleteResponse> => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const { threadId } = args;

        // Check if thread exists and belongs to user
        const thread = await prisma.thread.findFirst({
          where: {
            id: threadId,
            userId: context.user.id,
          },
        });

        if (!thread) {
          throw new Error('Thread not found');
        }

        // Delete thread (messages will be cascade deleted)
        await prisma.thread.delete({
          where: { id: threadId },
        });

        return {
          success: true,
          message: 'Thread deleted successfully',
        };
      } catch (error) {
        console.error('Delete thread error:', error);
        throw new Error('Failed to delete thread');
      }
    },
  },
};

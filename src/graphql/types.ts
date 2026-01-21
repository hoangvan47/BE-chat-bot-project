import { User } from '@prisma/client';

/**
 * GraphQL Context Type
 * Contains authenticated user information
 */
export interface GraphQLContext {
  user: User | null;
}

/**
 * GraphQL Resolver Types
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface Response {
  success: boolean;
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  threadId?: string | null;
  aiMessage?: string | null;
  usage?: UsageInfo | null;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ThreadsResponse {
  success: boolean;
  threads: any[];
  pageInfo: PageInfo;
}

export interface ThreadResponse {
  success: boolean;
  thread: any | null;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

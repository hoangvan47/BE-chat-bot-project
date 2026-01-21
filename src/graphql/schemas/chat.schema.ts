import { gql } from 'graphql-tag';

/**
 * GraphQL Schema: Chat with Pagination
 * Defines Thread, Message types and chat-related queries/mutations
 */

export const chatTypeDefs = gql`
  type Message {
    id: ID!
    threadId: String!
    content: String!
    sender: String!
    createdAt: String!
  }

  type Thread {
    id: ID!
    userId: String
    title: String
    latestMessage: String
    createdAt: String!
    updatedAt: String!
    messages: [Message!]
  }

  type ChatResponse {
    success: Boolean!
    message: String!
    threadId: String
    aiMessage: String
    usage: Usage
  }

  type Usage {
    promptTokens: Int
    completionTokens: Int
    totalTokens: Int
  }

  # Pagination types
  type PageInfo {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type ThreadsResponse {
    success: Boolean!
    threads: [Thread!]!
    pageInfo: PageInfo!
  }

  type ThreadResponse {
    success: Boolean!
    thread: Thread
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  extend type Query {
    # Get all threads for current user with pagination
    threads(page: Int, limit: Int): ThreadsResponse!
    
    # Get specific thread by ID
    thread(threadId: ID!): ThreadResponse!
  }

  extend type Mutation {
    # Send message and get AI response
    sendMessage(content: String!, threadId: ID): ChatResponse!
    
    # Delete thread
    deleteThread(threadId: ID!): DeleteResponse!
  }
`;

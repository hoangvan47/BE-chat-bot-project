import { gql } from 'graphql-tag';

/**
 * GraphQL Schema: Authentication
 * Defines User type and auth-related queries/mutations
 */

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    user: User
    accessToken: String
    refreshToken: String
  }

  type Response {
    success: Boolean!
    message: String!
  }

  type Query {
    # Get current logged-in user profile
    me: User!
  }

  type Mutation {
    # Register new user
    register(email: String!, username: String!, password: String!): AuthResponse!
    
    # Login user
    login(email: String!, password: String!): AuthResponse!
    
    # Logout user (requires authentication)
    logout: Response!
    
    # Refresh access token
    refreshToken(refreshToken: String!): AuthResponse!
  }
`;

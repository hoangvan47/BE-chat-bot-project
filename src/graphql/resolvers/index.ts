import { authResolvers } from './auth.resolvers';
import { chatResolvers } from './chat.resolvers';

/**
 * Merge all GraphQL resolvers
 */
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...chatResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...chatResolvers.Mutation,
  },
};

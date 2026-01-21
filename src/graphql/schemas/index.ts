import { authTypeDefs } from './auth.schema';
import { chatTypeDefs } from './chat.schema';

/**
 * Merge all GraphQL schemas
 */
export const typeDefs = [authTypeDefs, chatTypeDefs];

import takeRight from 'lodash/takeRight';

interface MessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerateAIMessagesParams {
  messages: MessageInput[];
  recentMessageCount?: number;
  systemPrompt?: string;
}

/**
 * Generate AI messages with context (Reused from noinghe_api project)
 * @param messages - Array of message objects with role and content
 * @param recentMessageCount - Number of recent messages to include (default: 4)
 * @param systemPrompt - System prompt for AI behavior
 * @returns Formatted messages array with system prompt
 */
export const generateAIMessages = ({
  messages,
  recentMessageCount = 4,
  systemPrompt = 'You are a helpful AI assistant. Provide concise and accurate responses.',
}: GenerateAIMessagesParams): MessageInput[] => {
  // Filter out empty messages
  const filterMessages = messages.filter((m) => m.content.trim() !== '');

  // Get recent messages for context
  const recentMessages = takeRight(filterMessages, recentMessageCount);

  // Create summary of recent conversation
  const summarizedRecentMessages = recentMessages
    .map((m) => `${m.role}: ${m.content}.`)
    .join(' ');

  // System message with context
  const summarizedMessage: MessageInput = {
    role: 'system',
    content: `${systemPrompt} Recent context: ${summarizedRecentMessages}`,
  };

  // Return system message + recent messages
  return [summarizedMessage, ...recentMessages];
};

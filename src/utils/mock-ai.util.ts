/**
 * Mock AI Responses (for development when OpenAI quota exceeded)
 * Remove this file in production!
 */

const MOCK_RESPONSES = [
  'Xin chào! Tôi là AI assistant. Tôi có thể giúp gì cho bạn?',
  'Đây là mock response vì OpenAI API đã hết quota.',
  'Hãy add credits vào OpenAI account để sử dụng GPT-4o-mini thực.',
  'Trong development mode, tôi sẽ trả lời với mock data.',
  'Câu hỏi của bạn rất hay! (Mock response)',
];

/**
 * Generate mock AI response
 * @param userMessage - User's message
 * @returns Mock AI response
 */
export const generateMockResponse = (userMessage: string): string => {
  // Random response from pool
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
  let response = MOCK_RESPONSES[randomIndex];

  // Add context if user asks question
  if (userMessage.includes('?')) {
    response = `Về câu hỏi "${userMessage}", ${response}`;
  }

  // Add user's topic to response
  if (userMessage.length > 5) {
    response += ` Bạn vừa nói về: "${userMessage.substring(0, 50)}..."`;
  }

  return response;
};

/**
 * Check if should use mock (when OpenAI fails)
 */
export const shouldUseMock = (): boolean => {
  return process.env.USE_MOCK_AI === 'true';
};

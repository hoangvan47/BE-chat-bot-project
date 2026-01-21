
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}


export const generateAIResponse = async (
  input: string,
  model: string = 'gpt-5-nano'
): Promise<{ response: string; usage: any }> => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for template.net. Provide concise, accurate, and friendly responses in Vietnamese.',
        },
        {
          role: 'user',
          content: input,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      response: response.choices[0].message.content || 'No response',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.warn('OpenAI quota exceeded - using mock response');
      return {
        response: generateMockResponse(input),
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }
    
    throw error;
  }
};

/**
 * Generate AI response with conversation history
 */
export const generateAIResponseWithHistory = async (
  messages: Message[],
  model: string = 'gpt-5-nano'
): Promise<{ response: string; usage: any }> => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for template.net. Provide concise, accurate, and friendly responses.',
        },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      response: response.choices[0].message.content || 'No response',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Fallback to mock if quota exceeded
    if (error.status === 429 || error.code === 'insufficient_quota') {
      const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
      return {
        response: generateMockResponse(lastUserMessage?.content || ''),
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
    
    throw error;
  }
};

/**
 * Mock response generator (fallback when API fails)
 */
const generateMockResponse = (input: string): string => {
  const responses = [
    `Tôi hiểu câu hỏi của bạn về "${input}". Đây là mock response vì OpenAI API quota đã hết.`,
    'Để sử dụng AI thực, vui lòng thêm credits vào OpenAI account.',
    `Câu hỏi hay! Về "${input}", tôi sẽ trả lời chi tiết khi có OpenAI credits.`,
    'Mock AI: Tôi là assistant giả lập. Add credits để chat với GPT thực!',
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Format conversation for OpenAI (helper function)
 * @deprecated - Use generateAIResponseWithHistory instead
 */
export interface GenerateAIMessagesOptions {
  messages: { role: 'user' | 'assistant'; content: string }[];
  recentMessageCount?: number;
  systemPrompt?: string;
}

export const generateAIMessages = (options: GenerateAIMessagesOptions): Message[] => {
  const { messages, recentMessageCount = 4, systemPrompt } = options;

  // Take only recent messages for context
  const recentMessages = messages.slice(-recentMessageCount);

  // Prepend system prompt
  const aiMessages: Message[] = [];

  if (systemPrompt) {
    aiMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  aiMessages.push(...recentMessages);

  return aiMessages;
};

export default openai;

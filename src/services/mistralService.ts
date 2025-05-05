import { MistralMessage, MistralRequestBody, MistralResponse } from '../types';

// System prompt for the AI assistant focused on waste management
const SYSTEM_PROMPT = `You are an AI assistant specialized in waste management concerns verification.
Your role is to analyze concerns submitted by residents and determine if they are legitimate waste management issues or not.

When analyzing concerns:
- Legitimate issues include: garbage collection problems, recycling issues, waste container problems, illegal dumping, etc.
- Nonsense or invalid concerns include: completely unrelated topics, spam, inappropriate content, etc.

Keep your responses concise and to the point, focusing on determining whether a concern is legitimate or nonsense.
Always provide a brief explanation for your classification.`;

export const mistralService = {
  async sendMessage(messages: MistralMessage[]): Promise<string> {
    try {
      // Get environment variables
      const apiUrl = import.meta.env.VITE_MISTRAL_API_URL;
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
      const model = import.meta.env.VITE_MISTRAL_MODEL;
      const maxTokens = parseInt(import.meta.env.VITE_MAX_TOKENS || '4000');
      const temperature = parseFloat(import.meta.env.VITE_TEMPERATURE || '0.4');
      
      // Ensure API key is provided
      if (!apiKey) {
        console.error('Mistral API key is missing');
        throw new Error('Mistral API key is missing. Please set VITE_MISTRAL_API_KEY in your .env file');
      }
      
      // Create full conversation with system prompt
      const fullMessages: MistralMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ];
      
      // Create request body
      const requestBody: MistralRequestBody = {
        model,
        messages: fullMessages,
        max_tokens: maxTokens,
        temperature
      };
      
      // Send request to Mistral API
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }
      
      const data: MistralResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error('No response received from the API');
      }
    } catch (error) {
      console.error('Error sending message to Mistral AI:', error);
      throw error;
    }
  }
}; 
import { LLMClient } from '../types';
import { GeminiClient } from './geminiService';

export class ChatGPTClient implements LLMClient {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly geminiFallback: GeminiClient;
  private readonly model = 'gpt-4o-mini';

  constructor(private apiKey?: string) {
    this.geminiFallback = new GeminiClient();
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("OpenAI API key not provided. Falling back to Gemini for ChatGPT simulation.");
      const systemInstruction = "You are simulating ChatGPT. Provide a detailed, conversational answer. Excel at creative writing, complex problem-solving, and generating human-like text across a wide variety of topics. Your strength lies in understanding context and nuance.";
      try {
        const fallbackResponse = await this.geminiFallback.generateResponse(prompt, systemInstruction);
        return `[Simulated via Gemini] ${fallbackResponse}`;
      } catch (error) {
        return Promise.reject(new Error("ChatGPT API key is missing and the Gemini fallback failed. Ensure API_KEY is set."));
      }
    }

    const requestBody = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const detail = errorData?.error?.message || errorData.message || response.statusText;
        throw new Error(`OpenAI API Error: ${response.status} ${detail}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response structure from OpenAI API.');
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      if (error instanceof Error) {
        return Promise.reject(error);
      }
      return Promise.reject(new Error("An unknown error occurred with the OpenAI API."));
    }
  }
}

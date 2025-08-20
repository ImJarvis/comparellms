import { LLMClient } from '../types';
import { GeminiClient } from './geminiService';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityChatCompletionRequest {
  model: string;
  messages: PerplexityMessage[];
}

interface PerplexityChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class PerplexityClient implements LLMClient {
  private readonly apiUrl = 'https://api.perplexity.ai/chat/completions';
  private readonly geminiFallback: GeminiClient;

  constructor(private apiKey?: string, private modelName: string = 'llama-3-sonar-small-32k-online') {
    this.geminiFallback = new GeminiClient();
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("Perplexity API key not provided. Falling back to Gemini for Perplexity simulation.");
      const systemInstruction = "You are simulating Perplexity AI. You are a conversational answer engine. Provide answers that are accurate and well-sourced. Be concise and, when possible, list web sources. Your responses should be grounded in verifiable facts.";
      try {
        const fallbackResponse = await this.geminiFallback.generateResponse(prompt, systemInstruction);
        return `[Simulated via Gemini] ${fallbackResponse}`;
      } catch (error) {
        return Promise.reject(new Error("Perplexity API key is missing and the Gemini fallback failed. Ensure API_KEY is set."));
      }
    }
    
    const requestBody: PerplexityChatCompletionRequest = {
      model: this.modelName,
      messages: [
        { role: 'user', content: prompt },
      ],
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
        throw new Error(`Perplexity API Error: ${response.status} ${detail}`);
      }

      const data: PerplexityChatCompletionResponse = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response structure from Perplexity API.');
      }
    } catch (error) {
      console.error("Error calling Perplexity API:", error);
      if (error instanceof Error) {
        return Promise.reject(error);
      }
      return Promise.reject(new Error("An unknown error occurred with the Perplexity API."));
    }
  }
}

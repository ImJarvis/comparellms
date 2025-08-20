import { LLMClient } from '../types';
import { GeminiClient } from './geminiService';

class DynamicMockClient implements LLMClient {
  private readonly geminiClient: GeminiClient;
  private readonly systemInstruction: string;

  constructor(geminiClient: GeminiClient, systemInstruction: string) {
    this.geminiClient = geminiClient;
    this.systemInstruction = systemInstruction;
  }

  generateResponse(prompt: string): Promise<string> {
    // Use the Gemini client to generate a response, but with a specific system instruction to simulate another model.
    return this.geminiClient.generateResponse(prompt, this.systemInstruction);
  }
}

export const createDynamicMockClient = (geminiClient: GeminiClient, systemInstruction: string): LLMClient => {
  return new DynamicMockClient(geminiClient, systemInstruction);
};
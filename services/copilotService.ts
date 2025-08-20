import { LLMClient } from '../types';
import { GeminiClient } from './geminiService';

export class CopilotClient implements LLMClient {
  private readonly geminiFallback: GeminiClient;

  constructor(private apiKey?: string) {
    this.geminiFallback = new GeminiClient();
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("Copilot API key not provided. Falling back to Gemini for Copilot simulation.");
      const systemInstruction = "You are simulating Microsoft Copilot. You specialize in code generation, completion, and explanation. If the prompt is about code, provide clear code examples. For general topics, answer concisely and efficiently, focusing on technical accuracy and clarity.";
       try {
        const fallbackResponse = await this.geminiFallback.generateResponse(prompt, systemInstruction);
        return `[Simulated via Gemini] ${fallbackResponse}`;
      } catch (error) {
        return Promise.reject(new Error("Copilot API key is missing and the Gemini fallback failed. Ensure API_KEY is set."));
      }
    }
    
    // As there isn't a standard, public API endpoint for Copilot in the same way as OpenAI,
    // this section is a placeholder. If you have access to an Azure OpenAI instance or a 
    // specific Copilot API, you would implement the fetch call here.
    const errorMessage = "A Copilot API Key was provided, but a real API endpoint for Copilot is not implemented in this application yet. This response is a placeholder.";
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
}

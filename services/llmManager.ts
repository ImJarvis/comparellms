import { LLM, LLMClient, SynthesizerResponse } from '../types';
import { GeminiClient } from './geminiService';
import { PerplexityClient } from './perplexityService';
import { ChatGPTClient } from './chatgptService';
import { CopilotClient } from './copilotService';
import { apiKeyService } from './apiKeyService';

class LLMManager {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }
  
  public generateAllResponses(prompt: string, models: LLM[]): Promise<string>[] {
    return models.map(model => {
      let client: LLMClient;
      switch (model) {
        case LLM.Gemini:
          client = this.geminiClient;
          break;
        case LLM.ChatGPT:
          client = new ChatGPTClient(apiKeyService.getApiKey(LLM.ChatGPT) || undefined);
          break;
        case LLM.Copilot:
          client = new CopilotClient(apiKeyService.getApiKey(LLM.Copilot) || undefined);
          break;
        case LLM.Perplexity:
          const perplexityApiKey = apiKeyService.getApiKey(LLM.Perplexity) || undefined;
          const perplexityModel = apiKeyService.getSetting(LLM.Perplexity, 'modelName') || 'llama-3-sonar-small-32k-online';
          client = new PerplexityClient(perplexityApiKey, perplexityModel);
          break;
        default:
          return Promise.reject(new Error(`Client for ${model} not found.`));
      }
      return client.generateResponse(prompt);
    });
  }

  public generateSummary(originalPrompt: string, responses: { model: LLM, content: string }[]): Promise<SynthesizerResponse> {
    // The summary generation always uses the primary Gemini client
    return this.geminiClient.generateSummary(originalPrompt, responses);
  }
}

export const llmManager = new LLMManager();

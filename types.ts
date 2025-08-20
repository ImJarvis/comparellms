
export enum LLM {
  Gemini = 'Gemini',
  ChatGPT = 'ChatGPT',
  Copilot = 'Copilot',
  Perplexity = 'Perplexity',
}

export type ResponseStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WebSource {
    uri?: string;
    title?: string;
}
export interface GroundingChunk {
    web?: WebSource;
}

export interface LLMResponse {
  model: LLM | 'Synthesizer';
  content: string;
  status: ResponseStatus;
  id: string;
  sources?: GroundingChunk[];
}

export interface LLMClient {
  generateResponse(prompt: string): Promise<string>;
}

export interface SynthesizerResponse {
  summaryText: string;
  sources: GroundingChunk[] | undefined;
}
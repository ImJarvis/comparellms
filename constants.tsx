
import React from 'react';
import { LLM } from './types';
import { GeminiIcon, ChatGPTIcon, CopilotIcon, PerplexityIcon } from './components/Icons';

export interface ModelConfig {
  name: LLM;
  Icon: React.FC<{ className?: string }>;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  { name: LLM.Gemini, Icon: GeminiIcon },
  { name: LLM.ChatGPT, Icon: ChatGPTIcon },
  { name: LLM.Copilot, Icon: CopilotIcon },
  { name: LLM.Perplexity, Icon: PerplexityIcon },
];

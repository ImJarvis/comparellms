import { LLM } from '../types';

// We only need user-configurable keys for non-Gemini models
const CONFIGURABLE_MODELS = [LLM.ChatGPT, LLM.Copilot, LLM.Perplexity];

const getKeyForModel = (model: LLM): string => `llm_comparator_api_key_${model.toUpperCase()}`;
const getKeyForSetting = (model: LLM, setting: string): string => `llm_comparator_setting_${model.toUpperCase()}_${setting}`;


export const apiKeyService = {
  saveApiKey: (model: LLM, key: string): void => {
    if (!CONFIGURABLE_MODELS.includes(model)) return;
    try {
      if (key) {
        localStorage.setItem(getKeyForModel(model), key);
      } else {
        localStorage.removeItem(getKeyForModel(model));
      }
    } catch (error) {
      console.error('Failed to save API key to localStorage:', error);
    }
  },

  getApiKey: (model: LLM): string | null => {
    if (!CONFIGURABLE_MODELS.includes(model)) return null;
    try {
      return localStorage.getItem(getKeyForModel(model));
    } catch (error) {
      console.error('Failed to get API key from localStorage:', error);
      return null;
    }
  },
  
  saveSetting: (model: LLM, setting: string, value: string): void => {
    if (!CONFIGURABLE_MODELS.includes(model)) return;
    try {
        if (value) {
            localStorage.setItem(getKeyForSetting(model, setting), value);
        } else {
            localStorage.removeItem(getKeyForSetting(model, setting));
        }
    } catch (error) {
      console.error(`Failed to save setting '${setting}' to localStorage:`, error);
    }
  },
  
  getSetting: (model: LLM, setting: string): string | null => {
     if (!CONFIGURABLE_MODELS.includes(model)) return null;
     try {
        return localStorage.getItem(getKeyForSetting(model, setting));
     } catch (error) {
        console.error(`Failed to get setting '${setting}' from localStorage:`, error);
        return null;
     }
  },
  
  getConfigurableModels: (): LLM[] => CONFIGURABLE_MODELS,
};

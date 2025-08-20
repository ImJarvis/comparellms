
import React, { useState, useEffect } from 'react';
import { LLM } from '../types';
import { apiKeyService } from '../services/apiKeyService';
import { MODEL_CONFIGS } from '../constants';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<{ [key: string]: string }>({});
  const [perplexityModel, setPerplexityModel] = useState<string>('');
  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>({});

  const configurableModels = apiKeyService.getConfigurableModels();
  
  useEffect(() => {
    if (isOpen) {
      const existingKeys: { [key: string]: string } = {};
      configurableModels.forEach(model => {
        const key = apiKeyService.getApiKey(model);
        if (key) {
          existingKeys[model] = key;
        }
      });
      setKeys(existingKeys);

      const savedModel = apiKeyService.getSetting(LLM.Perplexity, 'modelName');
      setPerplexityModel(savedModel || 'llama-3-sonar-small-32k-online');
      setSavedStatus({});
    }
  }, [isOpen, configurableModels]);

  const handleKeyChange = (model: LLM, value: string) => {
    setKeys(prev => ({ ...prev, [model]: value }));
    setSavedStatus(prev => ({ ...prev, [model]: false }));
  };
  
  const handleSave = (model: LLM) => {
    apiKeyService.saveApiKey(model, keys[model] || '');
    if (model === LLM.Perplexity) {
        apiKeyService.saveSetting(LLM.Perplexity, 'modelName', perplexityModel);
    }
    setSavedStatus(prev => ({ ...prev, [model]: true }));
     setTimeout(() => setSavedStatus(prev => ({...prev, [model]: false})), 2000);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className={`bg-black/60 absolute inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
      <div 
        className={`bg-brand-surface w-full max-w-md m-4 rounded-xl border border-brand-secondary shadow-2xl p-6 relative transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="settings-title" className="text-xl font-semibold text-brand-text-primary mb-1">Connect Your Models</h2>
        <p className="text-brand-text-secondary text-sm mb-6">
            To unleash the full power of models like ChatGPT, you need to provide your own API key. 
            <strong className="text-brand-text-primary">Your keys are stored securely only in your browser's local storage</strong> and are never sent to our servers.
        </p>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          aria-label="Close settings"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          {configurableModels.map(model => {
            const config = MODEL_CONFIGS.find(c => c.name === model);
            if (!config) return null;
            const { Icon } = config;
            return (
              <div key={model}>
                <label htmlFor={`${model}-key`} className="flex items-center mb-2 font-medium">
                   <Icon className="w-5 h-5 mr-2 text-brand-text-secondary"/>
                   {model} API Key
                </label>
                <div className="flex items-center space-x-2">
                   <input
                     id={`${model}-key`}
                     type="password"
                     value={keys[model] || ''}
                     onChange={e => handleKeyChange(model, e.target.value)}
                     placeholder={`Enter your ${model} key`}
                     className="flex-grow bg-brand-bg border border-brand-secondary/50 rounded-md p-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                   />
                   <button 
                      onClick={() => handleSave(model)}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${savedStatus[model] ? 'bg-green-600' : 'bg-brand-primary hover:bg-brand-primary-hover'} text-white`}
                    >
                      {savedStatus[model] ? 'Saved!' : 'Save'}
                   </button>
                </div>
                {model === LLM.Perplexity && (
                  <div className="mt-4">
                      <label htmlFor="perplexity-model" className="block text-sm font-medium text-brand-text-secondary mb-2">
                          Model Name
                      </label>
                      <input
                          id="perplexity-model"
                          type="text"
                          value={perplexityModel}
                          onChange={e => setPerplexityModel(e.target.value)}
                          placeholder="e.g., llama-3-sonar-small-32k-online"
                          className="w-full bg-brand-bg border border-brand-secondary/50 rounded-md p-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                      />
                      <p className="text-xs text-brand-text-secondary/70 mt-1">
                          The default is `llama-3-sonar-small-32k-online`. Change if you have issues.
                      </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
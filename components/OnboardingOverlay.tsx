
import React, { useState } from 'react';
import { LLM } from '../types';
import { MODEL_CONFIGS } from '../constants';
import { BrandIcon } from './Icons';

interface OnboardingOverlayProps {
  isVisible: boolean;
  onComplete: (selectedModels: LLM[]) => void;
}

const SelectableModelCard: React.FC<{
  config: typeof MODEL_CONFIGS[0];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ config, isSelected, onSelect }) => {
  const { name, Icon } = config;
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center text-center p-6 bg-brand-surface rounded-xl border-2 transition-all duration-200 hover:bg-brand-secondary/50 ${isSelected ? 'border-brand-primary shadow-lg' : 'border-brand-secondary/20'}`}
      aria-pressed={isSelected}
    >
      <Icon className="w-12 h-12 mb-4 text-brand-text-secondary" />
      <span className="font-semibold text-brand-text-primary">{name}</span>
    </button>
  );
};


const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isVisible, onComplete }) => {
  const [selectedModels, setSelectedModels] = useState<LLM[]>([]);

  const toggleModelSelection = (modelName: LLM) => {
    setSelectedModels(prev =>
      prev.includes(modelName)
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };
  
  const isValidSelection = selectedModels.length >= 2 && selectedModels.length <= 4;

  return (
    <div className={`fixed inset-0 bg-brand-bg z-50 flex items-center justify-center transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-2xl text-center p-4">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <BrandIcon className="w-10 h-10 text-brand-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Welcome to LLM Comparator</h1>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Select Models to Compare</h2>
        <p className="text-brand-text-secondary mb-8">Select at least 2 models (up to 4) for a side-by-side comparison.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {MODEL_CONFIGS.map(config => (
            <SelectableModelCard
              key={config.name}
              config={config}
              isSelected={selectedModels.includes(config.name)}
              onSelect={() => toggleModelSelection(config.name)}
            />
          ))}
        </div>

        <button
          onClick={() => onComplete(selectedModels)}
          disabled={!isValidSelection}
          className="w-full max-w-xs mx-auto py-3 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all duration-200"
        >
          Start Comparing
        </button>
      </div>
    </div>
  );
};

export default OnboardingOverlay;

import React, { useState, useCallback } from 'react';
import { LLMResponse, LLM } from './types';
import { llmManager } from './services/llmManager';
import PromptInput from './components/PromptInput';
import ResponseCard from './components/ResponseCard';
import SummaryCard from './components/SummaryCard';
import { BrandIcon, SettingsIcon } from './components/Icons';
import OnboardingOverlay from './components/OnboardingOverlay';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [summary, setSummary] = useState<LLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedModels, setSelectedModels] = useState<LLM[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleModelSelection = (models: LLM[]) => {
    setSelectedModels(models);
    setShowOnboarding(false);
  };

  const initializeResponses = useCallback(() => {
    const initialResponses = selectedModels.map(modelName => ({
      model: modelName,
      content: '',
      status: 'loading' as const,
      id: `${modelName}-${Date.now()}`
    }));
    setResponses(initialResponses);
    setSummary(null);
  }, [selectedModels]);

  const handlePromptSubmit = useCallback(async (currentPrompt: string) => {
    if (!currentPrompt.trim() || isLoading) return;

    setIsLoading(true);
    initializeResponses();

    const responsePromises = llmManager.generateAllResponses(currentPrompt, selectedModels);
    const results = await Promise.allSettled(responsePromises);

    const finalResponses = results.map((result, index) => {
      const modelName = selectedModels[index];
      if (result.status === 'fulfilled') {
        return { model: modelName, content: result.value, status: 'success' as const, id: `${modelName}-${Date.now()}` };
      } else {
        console.error(`Error from ${modelName}:`, result.reason);
        return { model: modelName, content: 'An error occurred. Please check the console.', status: 'error' as const, id: `${modelName}-${Date.now()}` };
      }
    });
    setResponses(finalResponses);

    const successfulResponses = finalResponses
      .filter(r => r.status === 'success')
      .map(r => ({ model: r.model as LLM, content: r.content }));

    if (successfulResponses.length > 0) {
      setSummary({ id: 'summary-card', model: 'Synthesizer', content: '', status: 'loading' });
      try {
        const { summaryText, sources } = await llmManager.generateSummary(currentPrompt, successfulResponses);
        setSummary({ id: 'summary-card', model: 'Synthesizer', content: summaryText, status: 'success', sources: sources });
      } catch (error) {
        console.error("Error generating summary:", error);
        setSummary({ id: 'summary-card', model: 'Synthesizer', content: 'An error occurred while generating the summary.', status: 'error' });
      }
    }

    setIsLoading(false);
  }, [isLoading, initializeResponses, selectedModels]);
  
  const showWelcomeScreen = responses.length === 0 && !summary;
  
  const gridColsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
  };
  const gridColsClass = gridColsClasses[responses.length] || 'grid-cols-2';


  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary flex flex-col font-sans">
      <OnboardingOverlay isVisible={showOnboarding} onComplete={handleModelSelection} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <header className="w-full p-4 flex items-center justify-between border-b border-brand-secondary sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-20">
        <div className="flex items-center space-x-3">
          <BrandIcon className="w-8 h-8 text-brand-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">LLM Comparator</h1>
        </div>
         <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors" aria-label="Open API Key Settings">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow w-full max-w-screen-2xl mx-auto p-4 md:p-8 flex flex-col">
        {showWelcomeScreen ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold mb-4">Compare AI Models</h2>
            <p className="text-brand-text-secondary max-w-2xl">
              Enter a prompt to see responses from {selectedModels.join(', ')} side-by-side and get a single, synthesized answer.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {summary && (
                <div className="w-full max-w-4xl mx-auto flex-shrink-0">
                    <SummaryCard response={summary} />
                </div>
            )}
            {responses.length > 0 && (
                <div className={`grid ${gridColsClass} gap-6`}>
                    {responses.map((response) => (
                        <ResponseCard key={response.id} response={response} />
                    ))}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 w-full bg-brand-bg/80 backdrop-blur-lg p-4 border-t border-brand-secondary mt-auto">
        <div className="max-w-3xl mx-auto">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handlePromptSubmit}
            isLoading={isLoading}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
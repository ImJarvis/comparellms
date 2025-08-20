
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LLMResponse } from '../types';
import { MODEL_CONFIGS } from '../constants';

interface ResponseCardProps {
  response: LLMResponse;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-3 animate-pulse-fast">
    <div className="h-4 bg-brand-secondary/50 rounded w-3/4"></div>
    <div className="h-4 bg-brand-secondary/50 rounded w-full"></div>
    <div className="h-4 bg-brand-secondary/50 rounded w-5/6"></div>
     <div className="h-4 bg-brand-secondary/50 rounded w-1/2"></div>
  </div>
);

const ResponseCard: React.FC<ResponseCardProps> = ({ response }) => {
  const config = MODEL_CONFIGS.find(c => c.name === response.model);
  if (!config) return null;

  const { Icon } = config;

  const simMarker = '[Simulated via Gemini]';
  const isSimulated = response.status === 'success' && response.content.startsWith(simMarker);
  const displayContent = isSimulated ? response.content.substring(simMarker.length).trim() : response.content;

  return (
    <div className="group bg-brand-surface rounded-xl border border-brand-secondary/70 p-5 flex flex-col shadow-md transition-all duration-300 hover:shadow-xl hover:border-brand-primary/50">
      <div className="flex items-center mb-4 flex-shrink-0">
        <Icon className="w-7 h-7 mr-3 text-brand-text-secondary" />
        <h2 className="text-xl font-semibold text-brand-text-primary">{response.model}</h2>
        {isSimulated && (
          <span className="ml-auto text-xs font-medium bg-brand-secondary/50 text-brand-text-secondary px-2 py-1 rounded-md border border-brand-secondary">
            Simulated
          </span>
        )}
      </div>
      <div className="flex-grow min-h-0 relative">
        <div className="overflow-hidden max-h-64 group-hover:max-h-[60rem] transition-[max-height] duration-700 ease-in-out">
            {response.status === 'loading' && <SkeletonLoader />}
            {response.status === 'error' && <p className="text-red-500">{response.content}</p>}
            {response.status === 'success' && (
              <div className="prose-styles pr-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
            )}
        </div>
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-surface to-transparent group-hover:opacity-0 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ResponseCard;
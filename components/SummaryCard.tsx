
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LLMResponse, LLM } from '../types';
import { SynthesizerIcon, StarIcon } from './Icons';

interface SummaryCardProps {
  response: LLMResponse;
}

interface SummaryData {
    analysis: {
        modelName: LLM;
        score: number;
        verdict: string;
    }[];
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse-fast">
    <div className="h-4 bg-brand-secondary/50 rounded w-3/4"></div>
    <div className="h-4 bg-brand-secondary/50 rounded w-full"></div>
    <div className="h-4 bg-brand-secondary/50 rounded w-full"></div>
    <div className="h-4 bg-brand-secondary/50 rounded w-5/6"></div>
  </div>
);

const renderStars = (score: number) => {
    const rating = Math.round(score / 20);
    return (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5" filled={i < rating} />
            ))}
        </div>
    );
};

const SummaryCard: React.FC<SummaryCardProps> = ({ response }) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [parseError, setParseError] = useState<boolean>(false);

  useEffect(() => {
    if (response.status === 'success' && response.content) {
      try {
        // Clean the response text before parsing
        const cleanedContent = response.content.replace(/```json\n?/, '').replace(/```$/, '');
        const parsed = JSON.parse(cleanedContent);
        setSummaryData(parsed);
        setParseError(false);
      } catch (e) {
        console.error("Failed to parse summary JSON:", e);
        setSummaryData(null);
        setParseError(true);
      }
    } else {
        setSummaryData(null);
        setParseError(false);
    }
  }, [response]);

  const validSources = response.sources?.filter(source => source.web?.uri) ?? [];
  
  const renderContent = () => {
    if (summaryData) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-brand-text-primary mb-3">Head-to-Head Analysis</h3>
          <div className="space-y-4">
            {summaryData.analysis.map((item, index) => (
              <div key={index} className="p-3 bg-brand-bg rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-brand-text-primary">{item.modelName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-brand-text-primary">{item.score}<span className="text-xs font-normal text-brand-text-secondary/80">/100</span></span>
                        {renderStars(item.score)}
                      </div>
                  </div>
                  <p className="text-brand-text-secondary text-sm">{item.verdict}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Fallback for non-JSON content or parsing errors
    return (
      <div className="prose-styles">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{response.content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-xl border border-brand-primary/50 p-5 flex flex-col shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:border-brand-primary">
      <div className="flex items-center mb-4 flex-shrink-0">
        <SynthesizerIcon className="w-7 h-7 mr-3 text-brand-primary" />
        <h2 className="text-xl font-semibold text-brand-text-primary">Summary & Analysis</h2>
      </div>
      <div className="text-brand-text-secondary text-base leading-relaxed mb-4">
        {response.status === 'loading' && <SkeletonLoader />}
        {response.status === 'error' && <p className="text-red-500">{parseError ? "Failed to parse the summary data." : response.content}</p>}
        {response.status === 'success' && renderContent()}
      </div>
      {response.status === 'success' && validSources.length > 0 && (
        <div className="flex-shrink-0 border-t border-brand-secondary pt-4">
            <div className="flex items-center gap-3 flex-wrap">
                 <h3 className="text-sm font-semibold text-brand-text-primary">Sources:</h3>
                {validSources.map((source, index) => {
                    try {
                        const url = new URL(source.web!.uri!);
                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
                        return (
                          <a 
                            key={index}
                            href={source.web!.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group/link inline-block"
                            title={source.web!.title || source.web!.uri}
                          >
                            <img src={faviconUrl} alt={`Favicon for ${url.hostname}`} className="w-6 h-6 rounded-md object-cover ring-2 ring-brand-secondary/50 group-hover/link:ring-brand-primary transition-all duration-200" />
                          </a>
                        )
                    } catch (e) {
                        return null; // Don't render if URL is invalid
                    }
                })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
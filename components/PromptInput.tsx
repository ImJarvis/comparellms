
import React, { useRef, useEffect } from 'react';
import { SendIcon } from './Icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSubmit(prompt);
      }
    }
  };
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(prompt);
      }}
      className="flex items-end bg-brand-surface rounded-xl p-2 border border-brand-secondary/50 focus-within:border-brand-primary transition-colors duration-200 shadow-lg"
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        className="flex-grow bg-transparent text-brand-text-primary placeholder-brand-text-secondary/50 resize-none border-none focus:ring-0 p-2 max-h-48"
        rows={1}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="ml-2 p-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
        aria-label="Send prompt"
      >
        {isLoading ? (
           <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
        ) : (
          <SendIcon className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default PromptInput;

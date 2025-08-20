import React from 'react';
import { LLMResponse } from '../types';
import ResponseCard from './ResponseCard';

interface ResponseGridProps {
  responses: LLMResponse[];
}

const ResponseGrid: React.FC<ResponseGridProps> = ({ responses }) => {
  const numResponses = responses.length;

  // Define column classes based on the number of responses for a more balanced look
  const gridCols = {
    1: 'lg:grid-cols-1', // Fallback
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  const colClass = gridCols[numResponses] || gridCols[2];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${colClass} gap-4 md:gap-6`}>
      {responses.map((response) => (
        <ResponseCard key={response.id} response={response} />
      ))}
    </div>
  );
};

export default ResponseGrid;
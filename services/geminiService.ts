
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { LLMClient, SynthesizerResponse, LLM } from '../types';

export class GeminiClient implements LLMClient {
  private readonly ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.error("API_KEY environment variable not set for Gemini. Real Gemini calls and fallbacks for other models will fail.");
    }
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.ai) {
      return Promise.reject(new Error("Gemini API Key is not configured. Please set API_KEY in your environment settings."));
    }
    try {
      const config = systemInstruction ? { systemInstruction } : undefined;
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
      });
      return response.text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini API Error: ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred with the Gemini API."));
    }
  }

  async generateSummary(originalPrompt: string, responses: { model: LLM, content: string }[]): Promise<SynthesizerResponse> {
     if (!this.ai) {
      return Promise.reject(new Error("Gemini API Key is not configured. Cannot generate summary."));
    }

    const assembledPrompt = `The user's original prompt was: "${originalPrompt}"\n\nHere are the responses from various AI models:\n\n${responses.map(r => `--- Response from ${r.model} ---\n${r.content}`).join('\n\n')}\n\nPlease analyze these responses and provide a synthesized answer based on the instructions.`;
    
    try {
      const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: assembledPrompt,
          config: {
              systemInstruction: `You are an expert fact-checker and a definitive judge of AI responses. Your primary role is to critically analyze and verify the information provided by different AI models using Google Search. 
Your output MUST be a single, valid JSON object and nothing else. Do not include any extra text, explanations, or markdown formatting (like \`\`\`json) outside of the JSON object itself.
The JSON object must conform to the following structure:
{
  "analysis": [
    {
      "modelName": "The name of the model being analyzed (e.g., 'Gemini', 'ChatGPT')",
      "score": "A numerical score of the response from 1 to 100, where 100 is best. Do not assign the same score to different models.",
      "verdict": "A brief, one-sentence verdict on its factual accuracy and quality."
    }
  ]
}`,
              tools: [{googleSearch: {}}],
          }
      });
      const summaryText = response.text;
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      return { summaryText, sources };
    } catch (error) {
      console.error("Error generating summary with Gemini:", error);
      if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini Summary Error: ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred while generating the summary."));
    }
  }
}
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

import { createModel, type AIModel, withRateLimitRetry, AI_MODEL_DISPLAY } from './ai/providers';
import { systemPrompt } from './prompt';

export async function generateFeedback({
  query,
  numQuestions = 3,
  modelId = 'gpt-4o', // Use gpt-4o as default
  apiKey,
}: {
  query: string;
  numQuestions?: number;
  modelId?: AIModel;
  apiKey?: string;
}) {
  const model = createModel(modelId, apiKey);
  const modelInfo = AI_MODEL_DISPLAY[modelId];

  // Use a fallback model if rate limited
  const generateWithFallback = async () => {
    try {
      // Check if the model supports structured outputs
      if (modelInfo.supportsStructuredOutput) {
        try {
          const result = await withRateLimitRetry(() => 
            generateObject({
              model,
              system: systemPrompt(),
              prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
              schema: z.object({
                questions: z
                  .array(z.string())
                  .describe(
                    `Follow up questions to clarify the research direction, max of ${numQuestions}`,
                  ),
              }),
            })
          );
          return result;
        } catch (error) {
          console.error("Error with structured output, falling back to text generation:", error);
          // If structured output fails, fall back to text generation
          const textResult = await generateText({
            model,
            system: systemPrompt(),
            prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear. Format your response as a numbered list, with one question per line, starting with "1. ". <query>${query}</query>`,
          });
          
          // Parse the text response into an array of questions
          const lines = textResult.split('\n').filter(line => line.trim());
          const questions = lines
            .filter(line => /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .slice(0, numQuestions);
          
          if (questions.length === 0) {
            // If no numbered questions were found, try to extract sentences
            const sentences = textResult.split(/[.!?]/).filter(s => s.trim().length > 10);
            return { object: { questions: sentences.slice(0, numQuestions) } };
          }
          
          return { object: { questions } };
        }
      } else {
        // For models that don't support structured outputs, use generateText instead
        const textResult = await withRateLimitRetry(() => 
          generateText({
            model,
            system: systemPrompt(),
            prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear. Format your response as a numbered list, with one question per line, starting with "1. ". <query>${query}</query>`,
          })
        );
        
        if (typeof textResult !== 'string') {
          throw new Error('Expected string response from text generation');
        }
        
        // Parse the text response into an array of questions
        const lines = textResult.split('\n').filter(line => line.trim());
        const questions = lines
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, numQuestions);
        
        if (questions.length === 0) {
          // If no numbered questions were found, try to extract sentences
          const sentences = textResult.split(/[.!?]/).filter(s => s.trim().length > 10);
          return { object: { questions: sentences.slice(0, numQuestions) } };
        }
        
        return { object: { questions } };
      }
    } catch (error) {
      console.error("Error with primary model, falling back to gpt-3.5-turbo:", error);
      
      // Fall back to gpt-3.5-turbo if there's an issue with the primary model
      const fallbackModel = createModel('gpt-3.5-turbo', apiKey);
      
      try {
        // gpt-3.5-turbo doesn't support structured outputs, so use generateText
        const textResult = await generateText({
          model: fallbackModel,
          system: systemPrompt(),
          prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear. Format your response as a numbered list, with one question per line, starting with "1. ". <query>${query}</query>`,
        });
        
        if (typeof textResult !== 'string') {
          throw new Error('Expected string response from text generation');
        }
        
        // Parse the text response into an array of questions
        const lines = textResult.split('\n').filter(line => line.trim());
        const questions = lines
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, numQuestions);
        
        if (questions.length === 0) {
          // If no numbered questions were found, try to extract sentences
          const sentences = textResult.split(/[.!?]/).filter(s => s.trim().length > 10);
          return { object: { questions: sentences.slice(0, numQuestions) } };
        }
        
        return { object: { questions } };
      } catch (finalError) {
        console.error("Final fallback error:", finalError);
        // If all else fails, return some generic questions
        return { 
          object: { 
            questions: [
              `What specific aspects of ${query} are you most interested in?`,
              `What is your goal for researching ${query}?`,
              `Do you have any specific requirements or constraints for this research?`
            ].slice(0, numQuestions) 
          } 
        };
      }
    }
  };

  try {
    const userFeedback = await generateWithFallback();
    return userFeedback.object.questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Fatal error in generateFeedback:", error);
    // Return generic questions as a last resort
    return [
      `What specific aspects of ${query} are you most interested in?`,
      `What is your goal for researching ${query}?`,
      `Do you have any specific requirements or constraints for this research?`
    ].slice(0, numQuestions);
  }
}

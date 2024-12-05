import type { Message, Property } from '../../types';
import { handleServiceError } from '../../utils/error';
import { openai } from './config';
import { generateSystemPrompt } from './prompts';
import { getMockResponse } from './mockResponses';

export const aiService = {
  async generateResponse(
    message: Message, 
    property: Property,
    bookingContext: { hasBooking: boolean; checkIn?: string; checkOut?: string; } = { hasBooking: false }
  ): Promise<string> {
    try {
      if (!openai) {
        console.warn('OpenAI is not configured. Using mock responses.');
        return getMockResponse();
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          { 
            role: "system", 
            content: generateSystemPrompt(property)
          },
          {
            role: "user",
            content: `Message du voyageur : "${message.text}"\n\nFournissez une réponse utile en tant que gestionnaire de la propriété.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return completion.choices[0]?.message?.content || 
        "Je m'excuse, je n'ai pas pu générer une réponse pour le moment. Veuillez réessayer.";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return getMockResponse();
    }
  }
};
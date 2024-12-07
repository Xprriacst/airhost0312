import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import airtableConversationService from '../../src/services/airtable/conversationService';
import { aiService } from '../../src/services/ai/aiService';

const messageSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  guestName: z.string().min(1, 'Guest Name is required'),
  guestEmail: z.string().email('A valid email is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  platform: z.enum(['whatsapp', 'sms', 'email']).default('whatsapp'),
  timestamp: z.string().optional(),
  // checkInDate et checkOutDate sont optionnels maintenant
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const data = messageSchema.parse(body);

    // Recherche de la propriété
    const properties = await propertyService.getProperties();
    const property = properties.find((p) => p.id === data.propertyId);

    if (!property) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    // Recherche d'une conversation existante
    const conversations = await airtableConversationService.fetchConversations(data.propertyId);
    let conversation = conversations.find(
      (c) => c.guestEmail === data.guestEmail && new Date(c.checkOut) >= new Date()
    );

    if (conversation) {
      // Ajouter le message à la conversation existante
      const messages = conversation.messages || [];
      messages.push({
        id: Date.now().toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
        sender: data.guestName,
      });

      await airtableConversationService.updateConversation(conversation.id, {
        Messages: JSON.stringify(messages),
      });
    } else {
      // Créer une nouvelle conversation si checkInDate et checkOutDate sont fournis
      if (!data.checkInDate || !data.checkOutDate) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Check-in and check-out dates are required for new conversations',
          }),
        };
      }

      conversation = await airtableConversationService.addConversation({
        Properties: [data.propertyId],
        'Guest Name': data.guestName,
        'Guest Email': data.guestEmail,
        'Check-in Date': data.checkInDate,
        'Check-out Date': data.checkOutDate,
        Status: 'Active',
        Platform: data.platform,
        Messages: JSON.stringify([
          {
            id: Date.now().toString(),
            text: data.message,
            isUser: false,
            timestamp: new Date(),
            sender: data.guestName,
          },
        ]),
      });
    }

    // Générer une réponse AI si l'auto-pilot est activé
    if (property.autoPilot) {
      const aiResponse = await aiService.generateResponse(
        {
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date(),
          sender: data.guestName,
        },
        property
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          conversationId: conversation.id,
          aiResponse,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversation.id,
      }),
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

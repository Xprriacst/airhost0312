import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import airtableConversationService from '../../src/services/airtable/conversationService';
import { aiService } from '../../src/services/ai/aiService';

// Schema de validation avec Zod
const messageSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  guestName: z.string().min(1, 'Guest Name is required'),
  guestEmail: z.string().email('A valid email is required'),
  checkInDate: z.string().min(1, 'Check-in Date is required'),
  checkOutDate: z.string().min(1, 'Check-out Date is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  platform: z.enum(['whatsapp', 'sms', 'email']).default('whatsapp'),
  timestamp: z.string().optional(),
});

export const handler: Handler = async (event) => {
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parser et valider le corps de la requête
    const body = JSON.parse(event.body || '{}');
    const data = messageSchema.parse(body);

    // Rechercher la propriété
    const properties = await propertyService.getProperties();
    const property = properties.find((p) => p.id === data.propertyId);

    if (!property) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    // Rechercher une conversation existante ou en créer une nouvelle
    const conversations = await airtableConversationService.fetchConversations(data.propertyId);
    let conversation = conversations.find(
      (c) =>
        c.guestEmail === data.guestEmail &&
        new Date(c.checkOut) >= new Date()
    );

    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = await airtableConversationService.addConversation({
        'Properties': [data.propertyId],
        'Guest Name': data.guestName,
        'Guest Email': data.guestEmail,
        'Check-in Date': data.checkInDate,
        'Check-out Date': data.checkOutDate,
        'Status': 'Active',
        'Platform': data.platform,
        'Messages': JSON.stringify([
          {
            id: Date.now().toString(),
            text: data.message,
            isUser: false,
            timestamp: data.timestamp || new Date().toISOString(),
            sender: data.guestName,
          },
        ]),
      });
    } else {
      // Ajouter le message à la conversation existante
      const messages = conversation.messages || [];
      messages.push({
        id: Date.now().toString(),
        text: data.message,
        isUser: false,
        timestamp: data.timestamp || new Date().toISOString(),
        sender: data.guestName,
      });

      await airtableConversationService.updateConversation(conversation.id, {
        Messages: JSON.stringify(messages),
      });
    }

    // Si l'auto-pilot est activé, générer une réponse AI
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
    console.error('Error processing webhook:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

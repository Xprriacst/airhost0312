import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import { conversationService } from '../../src/services/conversationService';

const messageSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  guestName: z.string().min(1, 'Guest Name is required'),
  guestEmail: z.string().email('A valid email is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  platform: z.enum(['whatsapp', 'sms', 'email']).default('whatsapp'),
  timestamp: z.string().optional(),
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
    console.log('➡️ Request body:', event.body);
    const body = JSON.parse(event.body || '{}');
    const data = messageSchema.parse(body);

    // Recherche de la propriété
    const properties = await propertyService.getProperties();
    const property = properties.find((p) => p.id === data.propertyId);

    if (!property) {
      console.error('❌ Property not found for ID:', data.propertyId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    // Recherche d'une conversation existante
    const existingConversation = await conversationService.findConversationByEmail(
      data.propertyId,
      data.guestEmail
    );

    let conversationId;

    if (existingConversation) {
      // Ajouter le message à la conversation existante
      console.log('✅ Adding message to existing conversation:', existingConversation.id);
      await conversationService.addMessage(existingConversation.id, {
        text: data.message,
        isUser: false,
        timestamp: new Date(data.timestamp || Date.now()),
        sender: data.guestName
      });
      conversationId = existingConversation.id;
    } else {
      // Créer une nouvelle conversation
      console.log('⚠️ No existing conversation found. Creating new one...');
      const newConversation = await conversationService.createConversation({
        Properties: [data.propertyId],
        'Guest Name': data.guestName,
        'Guest Email': data.guestEmail,
        Status: 'Active',
        Platform: data.platform,
        'Check-in Date': data.checkInDate,
        'Check-out Date': data.checkOutDate,
        Messages: JSON.stringify([{
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date(data.timestamp || Date.now()),
          sender: data.guestName
        }])
      });
      conversationId = newConversation.id;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId
      }),
    };
  } catch (error) {
    console.error('❌ Error processing message:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

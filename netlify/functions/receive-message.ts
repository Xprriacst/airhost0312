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
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.warn('❌ Méthode HTTP non autorisée:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  console.log('➡️ Réception d\'un message via webhook');

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('🔍 Corps de la requête brute:', body);

    const data = messageSchema.parse(body);
    console.log('✅ Données validées:', data);

    // Recherche de la propriété
    const properties = await propertyService.getProperties();
    const property = properties.find((p) => p.id === data.propertyId);

    if (!property) {
      console.error(`❌ Propriété avec l'ID ${data.propertyId} introuvable`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    // Recherche d'une conversation existante par email
    const conversations = await airtableConversationService.fetchConversations(data.propertyId);
    let conversation = conversations.find(
      (c) => c.guestEmail === data.guestEmail && new Date(c.checkOut) >= new Date()
    );

    if (conversation) {
      console.log('✓ Conversation existante trouvée:', conversation.id);
      // Ajouter le nouveau message à la conversation existante
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
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'No active conversation found for this guest email',
          message: 'Please provide check-in and check-out dates to start a new conversation'
        }),
      };
    }

    if (property.autoPilot) {
      console.log('🤖 Auto-pilot activé. Génération de la réponse AI...');
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
      console.log('🤖 Réponse AI générée:', aiResponse);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversation.id,
      }),
    };
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la requête:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

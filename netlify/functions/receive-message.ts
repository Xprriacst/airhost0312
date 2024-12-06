import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import airtableConversationService from '../../src/services/airtable/conversationService';
import { aiService } from '../../src/services/ai/aiService';

// Schéma de validation avec Zod
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
  if (event.httpMethod !== 'POST') {
    console.warn(`❌ Méthode HTTP non autorisée: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  console.log('➡️ Réception d’un message via webhook');

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('🔍 Corps de la requête brute:', body);

    const data = messageSchema.parse(body);
    console.log('✅ Données validées par Zod:', data);

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

    console.log('🏠 Propriété trouvée:', property);

    const conversations = await airtableConversationService.fetchConversations(data.propertyId);
    console.log(`🔍 ${conversations.length} conversation(s) trouvée(s) pour cette propriété.`);

    let conversation = conversations.find(
      (c) =>
        c.guestEmail === data.guestEmail &&
        new Date(c.checkOut) >= new Date()
    );

    if (!conversation) {
      console.log('➕ Aucune conversation active trouvée. Création d’une nouvelle...');
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
      console.log('✅ Nouvelle conversation créée:', conversation.id);
    } else {
      console.log('♻️ Conversation active trouvée. Ajout du message...');
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
      console.log('✅ Message ajouté à la conversation:', conversation.id);
    }

    if (property.autoPilot) {
      console.log('🤖 Auto-pilot activé. Génération de la réponse AI...');
      const aiResponse = await aiService.generateResponse(
        {
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date().toISOString(),
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

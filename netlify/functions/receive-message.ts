import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import { conversationService } from '../../src/services/conversationService';
import { aiService } from '../../src/services/ai/aiService';

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
    // Parse the incoming body
    const body = JSON.parse(event.body || '{}');
    console.log('➡️ Corps de la requête brute :', body);

    // Validate the incoming data against the schema
    const data = messageSchema.parse(body);
    console.log('➡️ Données validées après parsing :', data);

    // Check if guestEmail is missing or undefined
    if (!data.guestEmail) {
      console.error('❌ guestEmail est manquant ou indéfini :', data);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Guest email is required' }),
      };
    }

    // Recherche de la propriété
    const properties = await propertyService.getProperties();
    const property = properties.find((p) => p.id === data.propertyId);

    if (!property) {
      console.error('❌ Propriété introuvable pour ID :', data.propertyId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    console.log('✅ Propriété trouvée :', property);

    // Récupérer les conversations pour cette propriété et cet e-mail
    const conversations = await conversationService.fetchConversations(data.propertyId, data.guestEmail);
    console.log('Conversations récupérées :', conversations);

    // Vérifier s'il existe une conversation active avec cet email
    let conversation = conversations.find(
      (c) => new Date(c.checkOut) >= new Date()
    );

    if (conversation) {
      console.log('✅ Conversation existante trouvée :', conversation);

      // Ajouter le message à la conversation existante
      const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      messages.push({
        id: Date.now().toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
        sender: data.guestName,
      });

      await conversationService.updateConversation(conversation.id, {
        Messages: JSON.stringify(messages),
      });

      console.log('✅ Message ajouté à la conversation existante :', conversation.id);
    } else {
      console.log('⚠️ Aucune conversation active trouvée. Création d\'une nouvelle conversation.');

      if (!data.checkInDate || !data.checkOutDate) {
        console.error('❌ Dates manquantes pour créer une nouvelle conversation.');
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Check-in and check-out dates are required for new conversations',
          }),
        };
      }

      conversation = await conversationService.addConversation({
        Properties: [data.propertyId],
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
            timestamp: new Date(),
            sender: data.guestName,
          },
        ]),
      });

      console.log('✅ Nouvelle conversation créée :', conversation.id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversation.id,
      }),
    };
  } catch (error) {
    console.error('❌ Erreur lors du traitement du message :', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

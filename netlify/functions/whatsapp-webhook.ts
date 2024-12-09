import { Handler } from '@netlify/functions';
import { conversationService, propertyService, aiService } from '../../src/services';
import { whatsappService } from '../../src/services/whatsapp/whatsappService';

export const handler: Handler = async (event) => {
  // Handle WhatsApp verification challenge
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    if (!mode || !token || !challenge) {
      return {
        statusCode: 400,
        body: 'Missing parameters'
      };
    }

    const validationResponse = whatsappService.validateWebhook(mode, token, challenge);
    if (validationResponse) {
      return {
        statusCode: 200,
        body: validationResponse
      };
    }

    return {
      statusCode: 403,
      body: 'Invalid verification token'
    };
  }

  // Handle incoming messages
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      // Extract the message data
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (!value || !value.messages || value.messages.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid message format' })
        };
      }

      const message = value.messages[0];
      const from = message.from; // Phone number
      const text = message.text?.body;

      // Find the associated property and conversation
      // This is a simplified example - you'll need to implement your own logic
      // to match WhatsApp numbers to properties/conversations
      const properties = await propertyService.getProperties();
      const property = properties[0]; // For testing, use the first property

      if (!property) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Property not found' })
        };
      }

      // Create or update conversation
      const conversations = await conversationService.fetchPropertyConversations(property.id);
      let conversation = conversations.find(c => c.guestName === from); // Use phone number as guest name for now

      if (!conversation) {
        conversation = await conversationService.addConversation({
          Properties: [property.id],
          'Guest Name': from,
          'Guest Email': `${from}@whatsapp.com`, // Placeholder email
          Status: 'Active',
          Platform: 'whatsapp',
          Messages: JSON.stringify([{
            id: Date.now().toString(),
            text,
            isUser: false,
            timestamp: new Date(),
            sender: from
          }])
        });
      } else {
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
        messages.push({
          id: Date.now().toString(),
          text,
          isUser: false,
          timestamp: new Date(),
          sender: from
        });

        await conversationService.updateConversation(conversation.id, {
          Messages: JSON.stringify(messages)
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

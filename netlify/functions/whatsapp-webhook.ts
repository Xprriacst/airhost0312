import { Handler } from '@netlify/functions';
import { conversationService, propertyService, aiService } from '../../src/services';
import { whatsappService } from '../../src/services/whatsapp/whatsappService';
import { extractMessageFromWebhook, type WhatsAppWebhook } from '../../src/services/whatsapp/webhookHandler';

export const handler: Handler = async (event) => {
  // Handle WhatsApp verification challenge
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    if (!mode || !token || !challenge) {
      return { statusCode: 400, body: 'Missing parameters' };
    }

    const validationResponse = whatsappService.validateWebhook(mode, token, challenge);
    if (validationResponse) {
      return { statusCode: 200, body: validationResponse };
    }

    return { statusCode: 403, body: 'Invalid verification token' };
  }

  // Handle incoming messages
  if (event.httpMethod === 'POST' && event.body) {
    try {
      const webhookData = JSON.parse(event.body) as WhatsAppWebhook;
      const message = extractMessageFromWebhook(webhookData);
      
      if (!message) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid message format' })
        };
      }

      // Get the sender's WhatsApp number
      const senderNumber = message.sender;

      // Find associated property and conversation
      const conversations = await conversationService.fetchAllConversations();
      const conversation = conversations.find(c => c.guestName === senderNumber);

      if (conversation) {
        // Update existing conversation
        const messages = [...conversation.messages, message];
        await conversationService.updateConversation(conversation.id, {
          Messages: JSON.stringify(messages)
        });

        // Generate AI response if auto-pilot is enabled
        const property = await propertyService.getPropertyById(conversation.propertyId);
        if (property?.autoPilot) {
          const aiResponse = await aiService.generateResponse(message, property);
          await whatsappService.sendMessage(senderNumber, aiResponse);
        }
      } else {
        // Create new conversation with first property (temporary solution)
        const properties = await propertyService.getProperties();
        const property = properties[0];

        if (property) {
          await conversationService.addConversation({
            Properties: [property.id],
            'Guest Name': senderNumber,
            'Guest Email': `${senderNumber}@whatsapp.com`,
            Status: 'Active',
            Platform: 'whatsapp',
            Messages: JSON.stringify([message])
          });
        }
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

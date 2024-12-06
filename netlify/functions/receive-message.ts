import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import airtableConversationService from '../../src/services/airtable/conversationService';
import { aiService } from '../../src/services/ai/aiService';

// Schema validation for incoming webhook
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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const data = messageSchema.parse(body);
    console.log('Parsed Request Data:', data);

    const property = await propertyService.getProperties().then((properties) =>
      properties.find((p) => p.id === data.propertyId)
    );

    if (!property) {
      console.error(`Property with ID ${data.propertyId} not found`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    const conversations = await airtableConversationService.fetchConversations(data.propertyId);
    let conversation = conversations.find(
      (c) => c.guestEmail === data.guestEmail && new Date(c.checkOut) >= new Date()
    );

    if (!conversation) {
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
            timestamp: data.timestamp || new Date().toISOString(),
            sender: data.guestName,
          },
        ]),
      });
    } else {
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversation.id,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }
};

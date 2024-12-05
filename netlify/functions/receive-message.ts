import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { propertyService } from '../../src/services/airtable/propertyService';
import { conversationService } from '../../src/services/airtable/conversationService';
import { aiService } from '../../src/services/ai/aiService';

// Schema validation for incoming webhook
const messageSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  guestName: z.string().min(1, 'Guest Name is required'),
  guestEmail: z.string().email('Valid email is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  platform: z.enum(['whatsapp', 'sms', 'email']).default('whatsapp'),
  timestamp: z.string().optional(), // ISO timestamp
});

export const handler: Handler = async (event) => {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse and validate the incoming request body
    const body = JSON.parse(event.body || '{}');
    const data = messageSchema.parse(body);

    console.log('Parsed Request Data:', data);

    // Fetch property details from Airtable
    console.log(`Fetching property with ID: ${data.propertyId}`);
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

    console.log('Property Found:', property);

    // Fetch or create a conversation
    const conversations = await conversationService.fetchConversations(data.propertyId);
    let conversation = conversations.find(
      (c) =>
        c.guestEmail === data.guestEmail && new Date(c.checkOut) >= new Date()
    );

    if (!conversation) {
      console.log('No active conversation found. Creating a new one...');
      conversation = await conversationService.addConversation({
        Properties: [data.propertyId],
        'Guest Name': data.guestName,
        'Guest Email': data.guestEmail,
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
      console.log('Active conversation found. Adding message to conversation...');
      const messages = conversation.messages || [];
      messages.push({
        id: Date.now().toString(),
        text: data.message,
        isUser: false,
        timestamp: data.timestamp || new Date().toISOString(),
        sender: data.guestName,
      });
      // Update conversation with new message (you might need to implement this)
    }

    // Generate AI response if the property has auto-pilot enabled
    if (property.autoPilot) {
      console.log('Auto-pilot is enabled. Generating AI response...');
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

      console.log('AI Response:', aiResponse);

      // Send AI response back to the guest via appropriate platform (e.g., WhatsApp, SMS)
      // Implement this logic as needed
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
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Invalid request',
      }),
    };
  }
};

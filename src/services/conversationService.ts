import Airtable from 'airtable';
import { env } from '../config/env';
import { handleServiceError } from '../utils/error';

// Initialize Airtable base only if credentials are available
const initializeAirtableBase = () => {
  if (!env.airtable.apiKey || !env.airtable.baseId) {
    return null;
  }
  return new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);
};

const base = initializeAirtableBase();

export const conversationService = {
  async fetchConversations(propertyId: string) {
    try {
      if (!base) {
        console.warn('Airtable is not configured. Using mock data.');
        return [
          {
            id: '1',
            propertyId,
            guestName: 'Demo Guest',
            guestEmail: 'demo@example.com',
            checkIn: '2024-03-15',
            checkOut: '2024-03-20',
            messages: [
              { 
                id: '1',
                text: 'Welcome to your stay!',
                isUser: true,
                timestamp: new Date(),
                sender: 'Host'
              }
            ],
            status: 'Confirmed'
          }
        ];
      }

      console.log(`Fetching conversations for property ID: ${propertyId}`);
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        propertyId,
        guestName: record.get('Guest Name') || '',
        guestEmail: record.get('Guest Email') || '',
        checkIn: record.get('Check-in Date') || '',
        checkOut: record.get('Check-out Date') || '',
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string'
              ? [{ text: rawMessages }]
              : JSON.parse(rawMessages || '[]');
          } catch {
            console.warn(`Invalid Messages format for record ${record.id}`);
            return [];
          }
        })(),
        status: record.get('Status') || 'Unknown',
      }));
    } catch (error) {
      return handleServiceError(error, 'Conversation.fetchConversations');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      console.log('Adding a new conversation to Airtable:', conversationData);
      const createdRecord = await base('Conversations').create({
        fields: conversationData,
      });

      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      return handleServiceError(error, 'Conversation.addConversation');
    }
  },

  async deleteConversation(conversationId: string) {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      console.log(`Deleting conversation with ID: ${conversationId}`);
      await base('Conversations').destroy(conversationId);
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'Conversation.deleteConversation');
    }
  },
};
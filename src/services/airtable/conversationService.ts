import Airtable from 'airtable';
import { env } from '../../config/env';

// Initialize Airtable base
const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

const airtableConversationService = {
  async fetchConversations(propertyId: string) {
    try {
      console.log('➡️ Fetching conversations for property ID:', propertyId);
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
          fields: ['Guest Name', 'Guest Email', 'Messages', 'Check-in Date', 'Check-out Date', 'Status', 'Platform'],
        })
        .all();

      console.log('✅ Airtable Response:', records);

      const formattedRecords = records.map((record) => ({
        id: record.id,
        guestName: record.get('Guest Name') || 'Unknown Name',
        guestEmail: record.get('Guest Email') || '',
        checkIn: record.get('Check-in Date') || '',
        checkOut: record.get('Check-out Date') || '',
        status: record.get('Status') || 'Unknown',
        platform: record.get('Platform') || 'Unspecified',
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch (error) {
            console.warn(`⚠️ Invalid message format for record ID ${record.id}:`, error);
            return [];
          }
        })(),
      }));

      console.log('✅ Formatted Conversations:', formattedRecords);
      return formattedRecords;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations.');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    try {
      console.log('➡️ Adding a new conversation:', conversationData);
      const createdRecord = await base('Conversations').create({
        fields: conversationData,
      });

      console.log('✅ Conversation Created:', createdRecord);
      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('❌ Error adding conversation:', error);
      throw new Error('Failed to add conversation.');
    }
  },

  async updateConversation(conversationId: string, updatedFields: Record<string, any>) {
    try {
      console.log(`➡️ Updating conversation ID ${conversationId} with fields:`, updatedFields);
      const updatedRecord = await base('Conversations').update(conversationId, {
        fields: updatedFields,
      });

      console.log('✅ Conversation Updated:', updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw new Error('Failed to update conversation.');
    }
  },
};

export default airtableConversationService;

import Airtable from 'airtable';
import { env } from '../../config/env';

const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

const airtableConversationService = {
  async fetchConversations(propertyId: string, guestEmail: string) {
    console.log(`➡️ Fetching conversations for propertyId=${propertyId}, guestEmail=${guestEmail}`);
    try {
      const records = await base('Conversations')
        .select({
          filterByFormula: `AND({Properties} = '${propertyId}', {Guest Email} = '${guestEmail}')`,
          fields: [
            'Guest Name',
            'Guest Email',
            'Messages',
            'Status',
            'Platform',
          ],
        })
        .all();

      if (records.length === 0) {
        console.log(`⚠️ No conversations found for propertyId=${propertyId} and guestEmail=${guestEmail}`);
        return [];
      }

      console.log('✅ Conversations found:', records.map((r) => r.fields));

      return records.map((record) => ({
        id: record.id,
        guestName: record.get('Guest Name') || 'Unknown',
        guestEmail: record.get('Guest Email') || '',
        status: record.get('Status') || 'Unknown',
        platform: record.get('Platform') || 'Not specified',
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
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations.');
    }
  },

  async updateConversation(conversationId: string, data: Record<string, any>) {
    console.log('➡️ Updating conversation ID:', conversationId);
    try {
      const updatedRecord = await base('Conversations').update(conversationId, data);
      console.log('✅ Conversation updated successfully:', updatedRecord.fields);
      return {
        id: updatedRecord.id,
        ...updatedRecord.fields,
      };
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw new Error('Failed to update conversation.');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    console.log('➡️ Creating a new conversation:', conversationData);
    try {
      const createdRecord = await base('Conversations').create(conversationData);
      console.log('✅ New conversation created:', createdRecord.fields);
      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw new Error('Failed to create conversation.');
    }
  },
};

export default airtableConversationService;

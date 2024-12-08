import { base } from './config';
import { handleServiceError } from '../../utils/error';
import type { Conversation } from '../../types';

const airtableConversationService = {
  async fetchAllConversations(): Promise<Conversation[]> {
    console.log('➡️ Fetching all conversations');
    try {
      const records = await base('Conversations')
        .select({
          view: 'Grid view',
          fields: [
            'Properties',
            'Guest Name',
            'Guest Email',
            'Messages',
            'Status',
            'Platform',
            'Check-in Date',
            'Check-out Date'
          ],
        })
        .all();

      return records.map(record => ({
        id: record.id,
        propertyId: Array.isArray(record.get('Properties')) 
          ? record.get('Properties')[0] 
          : record.get('Properties'),
        guestName: record.get('Guest Name') as string,
        guestEmail: record.get('Guest Email') as string,
        checkIn: record.get('Check-in Date') as string,
        checkOut: record.get('Check-out Date') as string,
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch (error) {
            console.warn(`⚠️ Invalid message format for record ${record.id}:`, error);
            return [];
          }
        })(),
        status: record.get('Status') as string,
        platform: record.get('Platform') as string
      }));
    } catch (error) {
      console.error('❌ Error fetching all conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  },

  async fetchPropertyConversations(propertyId: string): Promise<Conversation[]> {
    console.log(`➡️ Fetching conversations for property: ${propertyId}`);
    try {
      const records = await base('Conversations')
        .select({
          filterByFormula: `SEARCH("${propertyId}", {Properties})`,
          fields: [
            'Properties',
            'Guest Name',
            'Guest Email',
            'Messages',
            'Status',
            'Platform',
            'Check-in Date',
            'Check-out Date'
          ],
        })
        .all();

      return records.map(record => ({
        id: record.id,
        propertyId,
        guestName: record.get('Guest Name') as string,
        guestEmail: record.get('Guest Email') as string,
        checkIn: record.get('Check-in Date') as string,
        checkOut: record.get('Check-out Date') as string,
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch (error) {
            console.warn(`⚠️ Invalid message format for record ${record.id}:`, error);
            return [];
          }
        })(),
        status: record.get('Status') as string,
        platform: record.get('Platform') as string
      }));
    } catch (error) {
      console.error(`❌ Error fetching conversations for property ${propertyId}:`, error);
      throw new Error('Failed to fetch property conversations');
    }
  },

  async fetchConversationById(conversationId: string): Promise<Conversation> {
    console.log(`➡️ Fetching conversation by ID: ${conversationId}`);
    try {
      const record = await base('Conversations').find(conversationId);
      
      if (!record) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      const propertyIds = record.get('Properties') as string[];
      const propertyId = Array.isArray(propertyIds) ? propertyIds[0] : propertyIds;

      return {
        id: record.id,
        propertyId,
        guestName: record.get('Guest Name') as string,
        guestEmail: record.get('Guest Email') as string,
        checkIn: record.get('Check-in Date') as string,
        checkOut: record.get('Check-out Date') as string,
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch (error) {
            console.warn(`⚠️ Invalid message format for conversation ${conversationId}:`, error);
            return [];
          }
        })(),
        status: record.get('Status') as string,
        platform: record.get('Platform') as string
      };
    } catch (error) {
      console.error(`❌ Error fetching conversation ${conversationId}:`, error);
      throw new Error('Failed to fetch conversation');
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

  async deleteConversation(conversationId: string) {
    console.log('➡️ Deleting conversation:', conversationId);
    try {
      await base('Conversations').destroy(conversationId);
      console.log('✅ Conversation deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw new Error('Failed to delete conversation.');
    }
  }
};

export default airtableConversationService;

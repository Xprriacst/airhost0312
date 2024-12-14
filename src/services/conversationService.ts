import { base } from './airtable/config';
import { conversationQueries } from './airtable/queries';
import { messageUtils } from './airtable/utils';
import { mapRecordToConversation } from './airtable/mappers';
import type { MessageData } from './airtable/types';
import type { Conversation } from '../types';

class ConversationService {
  async fetchAllConversations(): Promise<Conversation[]> {
    console.log('➡️ Fetching all conversations');
    try {
      const records = await conversationQueries.findAll();
      return records.map(mapRecordToConversation);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  async fetchPropertyConversations(propertyId: string): Promise<Conversation[]> {
    console.log(`➡️ Fetching conversations for property: ${propertyId}`);
    try {
      const records = await conversationQueries.findByProperty(propertyId);
      return records.map(mapRecordToConversation);
    } catch (error) {
      console.error('❌ Error fetching property conversations:', error);
      throw new Error('Failed to fetch property conversations');
    }
  }

  async findConversationByEmail(propertyId: string, guestEmail: string): Promise<Conversation | null> {
    console.log(`➡️ Looking for conversation - Property: ${propertyId}, Email: ${guestEmail}`);
    try {
      const records = await conversationQueries.findByEmail(propertyId, guestEmail);
      
      if (records.length === 0) {
        console.log('⚠️ No conversation found');
        return null;
      }

      console.log('✅ Found existing conversation');
      return mapRecordToConversation(records[0]);
    } catch (error) {
      console.error('❌ Error finding conversation:', error);
      return null;
    }
  }

  async addMessage(conversationId: string, messageData: MessageData): Promise<boolean> {
    console.log(`➡️ Adding message to conversation ${conversationId}`);
    try {
      const record = await base('Conversations').find(conversationId);
      const currentMessages = messageUtils.parse(record.get('Messages'));
      const newMessage = messageUtils.create(messageData);

      await base('Conversations').update(conversationId, {
        Messages: JSON.stringify([...currentMessages, newMessage])
      });

      console.log('✅ Message added successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding message:', error);
      return false;
    }
  }

  async createConversation(data: Record<string, any>): Promise<Conversation> {
    console.log('➡️ Creating new conversation');
    try {
      const record = await base('Conversations').create(data);
      return mapRecordToConversation(record);
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }
}

export const conversationService = new ConversationService();

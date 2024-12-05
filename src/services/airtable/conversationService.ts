import { base } from './config';
import { createMockConversation } from './mockData';
import { mapRecordToConversation } from './mappers';
import { handleServiceError } from '../../utils/error';

export const conversationService = {
  /**
   * Fetches all conversations associated with a given property ID.
   * @param propertyId - The ID of the property.
   * @returns An array of conversations.
   */
  async fetchConversations(propertyId: string) {
    try {
      if (!base) {
        console.warn('Airtable is not configured. Returning mock data.');
        return [createMockConversation(propertyId)];
      }

      console.log(`Fetching conversations for property ID: ${propertyId}`);

      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`, // Airtable formula to filter by property
        })
        .all();

      console.log(`Fetched ${records.length} conversations for property ID: ${propertyId}`);
      return records.map((record) => mapRecordToConversation(record, propertyId));
    } catch (error) {
      return handleServiceError(error, 'Conversation.fetchConversations');
    }
  },

  /**
   * Adds a new conversation to Airtable.
   * @param conversationData - The data for the new conversation.
   * @returns The created conversation object.
   */
  async addConversation(conversationData: Record<string, any>) {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      console.log('Creating a new conversation with data:', conversationData);

      // Send data directly without the "fields" key
      const createdRecord = await base('Conversations').create(conversationData);

      console.log('New conversation created with ID:', createdRecord.id);
      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      return handleServiceError(error, 'Conversation.addConversation');
    }
  },

  /**
   * Deletes a conversation from Airtable.
   * @param conversationId - The ID of the conversation to delete.
   * @returns An object indicating success or failure.
   */
  async deleteConversation(conversationId: string) {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      console.log(`Deleting conversation with ID: ${conversationId}`);

      await base('Conversations').destroy(conversationId);

      console.log(`Conversation with ID: ${conversationId} has been deleted`);
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'Conversation.deleteConversation');
    }
  },
};

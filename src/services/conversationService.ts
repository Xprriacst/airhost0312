import { airtableConversationService } from './airtable/conversationService';

export const conversationService = {
  async fetchConversations(propertyId: string) {
    return airtableConversationService.fetchConversations(propertyId);
  },

  async addConversation(conversationData: Record<string, any>) {
    return airtableConversationService.addConversation(conversationData);
  },

  async deleteConversation(conversationId: string) {
    return airtableConversationService.deleteConversation(conversationId);
  },
};

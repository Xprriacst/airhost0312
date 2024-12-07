import airtableConversationService from './airtable/conversationService';
import type { Message } from '../types';

export const conversationService = {
  async fetchConversations(propertyId: string) {
    return airtableConversationService.fetchConversations(propertyId);
  },

  async fetchConversationById(conversationId: string) {
    return airtableConversationService.fetchConversationById(conversationId);
  },

  async updateConversation(conversationId: string, data: Record<string, any>) {
    return airtableConversationService.updateConversation(conversationId, data);
  },

  async addConversation(conversationData: Record<string, any>) {
    return airtableConversationService.addConversation(conversationData);
  },

  async deleteConversation(conversationId: string) {
    return airtableConversationService.deleteConversation(conversationId);
  }
};

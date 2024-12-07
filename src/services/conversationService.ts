import airtableConversationService from './airtable/conversationService';
import type { Message } from '../types';

export const conversationService = {
  async fetchConversations(propertyId: string, guestEmail: string) {
    // Appelle la méthode mise à jour dans airtableConversationService
    return airtableConversationService.fetchConversations(propertyId, guestEmail);
  },

  async fetchConversationById(conversationId: string) {
    // Récupère une conversation spécifique par son ID
    return airtableConversationService.fetchConversationById(conversationId);
  },

  async updateConversation(conversationId: string, data: Record<string, any>) {
    // Met à jour une conversation existante
    return airtableConversationService.updateConversation(conversationId, data);
  },

  async addConversation(conversationData: Record<string, any>) {
    // Ajoute une nouvelle conversation
    return airtableConversationService.addConversation(conversationData);
  },

  async deleteConversation(conversationId: string) {
    // Supprime une conversation
    return airtableConversationService.deleteConversation(conversationId);
  }
};

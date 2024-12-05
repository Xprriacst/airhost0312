import { base } from './config';
import { handleServiceError } from '../../utils/error';
import type { Message } from '../../types';

export const messageService = {
  async addMessageToConversation(
    conversationId: string,
    message: Message
  ): Promise<boolean> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const conversation = await base('Conversations').find(conversationId);
      const existingMessages = JSON.parse(conversation.get('Messages') || '[]');
      
      const updatedMessages = [...existingMessages, message];
      
      await base('Conversations').update(conversationId, {
        Messages: JSON.stringify(updatedMessages)
      });

      return true;
    } catch (error) {
      return handleServiceError(error, 'Message.addMessageToConversation');
    }
  },

  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const conversation = await base('Conversations').find(conversationId);
      const messages = conversation.get('Messages');
      
      try {
        return JSON.parse(messages || '[]');
      } catch {
        return [];
      }
    } catch (error) {
      return handleServiceError(error, 'Message.getMessagesForConversation');
    }
  }
};
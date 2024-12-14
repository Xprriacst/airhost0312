import { base } from './config';
import type { ConversationRecord } from './types';

export const conversationQueries = {
  async findByEmail(propertyId: string, guestEmail: string) {
    return base('Conversations')
      .select({
        filterByFormula: `AND(SEARCH("${propertyId}", {Properties}), {Guest Email} = "${guestEmail}")`,
        maxRecords: 1
      })
      .all();
  },

  async findByProperty(propertyId: string) {
    return base('Conversations')
      .select({
        filterByFormula: `SEARCH("${propertyId}", {Properties})`,
        sort: [{ field: 'Check-in Date', direction: 'desc' }]
      })
      .all();
  },

  async findAll() {
    return base('Conversations')
      .select({
        view: 'Grid view',
        sort: [{ field: 'Check-in Date', direction: 'desc' }]
      })
      .all();
  }
};

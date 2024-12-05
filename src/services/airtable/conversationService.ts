import Airtable from 'airtable';
import { env } from '../../config/env';

// Initialisation de la base Airtable
const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

const airtableConversationService = {
  async fetchConversations(propertyId: string) {
    try {
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
          fields: ['Guest Name', 'Messages', 'Check-in Date', 'Check-out Date', 'Status', 'Platform'],
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        guestName: record.get('Guest Name') || 'Nom inconnu',
        guestEmail: record.get('Guest Email') || '',
        checkIn: record.get('Check-in Date') || '',
        checkOut: record.get('Check-out Date') || '',
        status: record.get('Status') || 'Inconnu',
        platform: record.get('Platform') || 'Non spécifié',
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch {
            console.warn(`Invalid Messages format for record ${record.id}`);
            return [];
          }
        })(),
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Erreur lors de la récupération des conversations.');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    try {
      const createdRecord = await base('Conversations').create({
        fields: conversationData,
      });

      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('Error adding conversation:', error);
      throw new Error('Erreur lors de l\'ajout de la conversation.');
    }
  },

  async deleteConversation(conversationId: string) {
    try {
      await base('Conversations').destroy(conversationId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Erreur lors de la suppression de la conversation.');
    }
  },
};

// Export par défaut
export default airtableConversationService;

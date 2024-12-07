import Airtable from 'airtable';
import { env } from '../../config/env';
import type { Message } from '../../types';

const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

const airtableConversationService = {
  async fetchConversations(propertyId: string) {
    try {
      console.log('➡️ Récupération des conversations pour la propriété ID:', propertyId);
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
          fields: [
            'Guest Name',
            'Guest Email',
            'Messages',
            'Check-in Date',
            'Check-out Date',
            'Status',
            'Platform',
          ],
        })
        .all();

      const formattedRecords = records.map((record) => ({
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
          } catch (error) {
            console.warn(`⚠️ Format de messages invalide pour le record ID ${record.id}:`, error);
            return [];
          }
        })(),
      }));

      return formattedRecords;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations :', error);
      throw new Error('Impossible de récupérer les conversations.');
    }
  },

  async fetchConversationById(conversationId: string) {
    try {
      console.log('➡️ Récupération de la conversation ID:', conversationId);
      const record = await base('Conversations').find(conversationId);

      return {
        id: record.id,
        guestName: record.get('Guest Name') || 'Nom inconnu',
        guestEmail: record.get('Guest Email') || '',
        checkIn: record.get('Check-in Date') || '',
        checkOut: record.get('Check-out Date') || '',
        status: record.get('Status') || 'Inconnu',
        platform: record.get('Platform') || 'Non spécifié',
        properties: record.get('Properties') || [],
        messages: (() => {
          const rawMessages = record.get('Messages');
          try {
            return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages || [];
          } catch (error) {
            console.warn(`⚠️ Format de messages invalide pour le record ID ${record.id}:`, error);
            return [];
          }
        })(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la conversation :', error);
      throw new Error('Impossible de récupérer la conversation.');
    }
  },

  async updateConversation(conversationId: string, data: Record<string, any>) {
    try {
      console.log('➡️ Mise à jour de la conversation ID:', conversationId);
      const updatedRecord = await base('Conversations').update(conversationId, data);

      return {
        id: updatedRecord.id,
        ...updatedRecord.fields,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la conversation :', error);
      throw new Error('Impossible de mettre à jour la conversation.');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    try {
      console.log('➡️ Création d\'une nouvelle conversation');
      const createdRecord = await base('Conversations').create(conversationData);

      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation :', error);
      throw new Error('Impossible de créer la conversation.');
    }
  },

  async deleteConversation(conversationId: string) {
    try {
      console.log('➡️ Suppression de la conversation ID:', conversationId);
      await base('Conversations').destroy(conversationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation :', error);
      throw new Error('Impossible de supprimer la conversation.');
    }
  }
};

export default airtableConversationService;

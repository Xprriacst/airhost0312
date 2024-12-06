import Airtable from 'airtable';
import { env } from '../../config/env';

// Initialisation de la base Airtable
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

      console.log('✅ Réponse d\'Airtable :', records);

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

      console.log('✅ Conversations formatées :', formattedRecords);
      return formattedRecords;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations :', error);
      throw new Error('Impossible de récupérer les conversations.');
    }
  },

  async fetchConversationById(conversationId: string) {
    try {
      console.log('➡️ Récupération de la conversation par ID:', conversationId);
      const records = await base('Conversations')
        .select({
          filterByFormula: `RECORD_ID() = '${conversationId}'`,
          fields: [
            'Guest Name',
            'Guest Email',
            'Messages',
            'Check-in Date',
            'Check-out Date',
            'Status',
            'Platform',
            'Properties',
          ],
          maxRecords: 1,
        })
        .all();

      if (records.length === 0) {
        throw new Error(`Aucune conversation trouvée pour l'ID ${conversationId}`);
      }

      const record = records[0];
      const conversation = {
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

      console.log('✅ Conversation récupérée :', conversation);
      return conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la conversation :', error);
      throw new Error('Impossible de récupérer la conversation.');
    }
  },

  async addConversation(conversationData: Record<string, any>) {
    try {
      console.log('➡️ Ajout d\'une nouvelle conversation :', conversationData);
      const createdRecords = await base('Conversations').create([
        {
          fields: {
            'Guest Name': conversationData['Guest Name'],
            'Guest Email': conversationData['Guest Email'],
            'Check-in Date': conversationData['Check-in Date'],
            'Check-out Date': conversationData['Check-out Date'],
            'Messages': conversationData['Messages'],
            'Status': conversationData['Status'],
            'Platform': conversationData['Platform'],
            'Properties': conversationData['Properties'],
          },
        },
      ]);

      const createdRecord = createdRecords[0];

      console.log('✅ Conversation créée :', createdRecord);
      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de la conversation :', error);
      throw new Error('Impossible d\'ajouter la conversation.');
    }
  },

  async updateConversation(conversationId: string, updatedFields: Record<string, any>) {
    try {
      console.log(`➡️ Mise à jour de la conversation ID ${conversationId} avec les champs :`, updatedFields);
      const updatedRecords = await base('Conversations').update([
        {
          id: conversationId,
          fields: updatedFields,
        },
      ]);

      const updatedRecord = updatedRecords[0];

      console.log('✅ Conversation mise à jour :', updatedRecord);
      return {
        id: updatedRecord.id,
        ...updatedRecord.fields,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la conversation :', error);
      throw new Error('Impossible de mettre à jour la conversation.');
    }
  },
};

export default airtableConversationService;

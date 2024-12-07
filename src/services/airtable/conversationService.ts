import Airtable from 'airtable';
import { env } from '../../config/env';

const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

// Utilitaire pour formater les dates au format ISO (YYYY-MM-DD)
function formatDateToISO(date: string | Date): string {
  const parsedDate = new Date(date);
  return parsedDate.toISOString().split('T')[0]; // Retourne YYYY-MM-DD
}

const airtableConversationService = {
  async fetchConversations(propertyId: string, guestEmail: string) {
    console.log(`➡️ Recherche des conversations pour propertyId=${propertyId}, guestEmail=${guestEmail}`);
    try {
      const records = await base('Conversations')
        .select({
          filterByFormula: `AND({Properties} = '${propertyId}', {Guest Email} = '${guestEmail}')`,
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

      if (records.length === 0) {
        console.log(`⚠️ Aucune conversation trouvée pour propertyId=${propertyId} et guestEmail=${guestEmail}`);
      } else {
        console.log(`✅ Conversations trouvées :`, records.map((r) => r.fields));
      }

      return records.map((record) => ({
        id: record.id,
        guestName: record.get('Guest Name') || 'Nom inconnu',
        guestEmail: record.get('Guest Email') || '',
        checkIn: formatDateToISO(record.get('Check-in Date') || ''),
        checkOut: formatDateToISO(record.get('Check-out Date') || ''),
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
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations :', error);
      throw new Error('Impossible de récupérer les conversations.');
    }
  },

  async updateConversation(conversationId: string, data: Record<string, any>) {
    console.log('➡️ Mise à jour de la conversation ID:', conversationId);
    console.log('Données envoyées pour mise à jour :', data);
    try {
      const updatedRecord = await base('Conversations').update(conversationId, data);

      console.log('✅ Conversation mise à jour avec succès :', updatedRecord.fields);
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
    console.log('➡️ Création d\'une nouvelle conversation avec les données :', conversationData);
    try {
      const createdRecord = await base('Conversations').create(conversationData);

      console.log('✅ Nouvelle conversation créée :', createdRecord.fields);
      return {
        id: createdRecord.id,
        ...createdRecord.fields,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation :', error);
      throw new Error('Impossible de créer la conversation.');
    }
  },
};

export default airtableConversationService;

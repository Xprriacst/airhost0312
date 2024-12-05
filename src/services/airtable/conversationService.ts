import Airtable from 'airtable';
import { env } from '../../config/env';

// Initialisation de la base Airtable
const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

const airtableConversationService = {
  async fetchConversations(propertyId: string) {
    try {
      console.log('➡️ Requête pour les conversations de la propriété ID:', propertyId); // Log ajouté
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
          fields: ['Guest Name', 'Guest Email', 'Messages', 'Check-in Date', 'Check-out Date', 'Status', 'Platform'],
        })
        .all();

      console.log('✅ Réponse Airtable :', records); // Log ajouté

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
            console.warn(`⚠️ Format invalide pour les messages du record ID ${record.id}:`, error); // Log ajouté
            return [];
          }
        })(),
      }));

      console.log('✅ Conversations formatées:', formattedRecords); // Log ajouté
      return formattedRecords;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations :', error); // Log ajouté
      throw new Error('Impossible de récupérer les conversations.');
    }
  },
};

export default airtableConversationService;

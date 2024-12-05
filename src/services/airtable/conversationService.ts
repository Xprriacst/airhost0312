import Airtable from 'airtable';
import { env } from '../../config/env';

// Initialisation de la base Airtable
const base = new Airtable({ apiKey: env.airtable.apiKey }).base(env.airtable.baseId);

// Service pour gérer les conversations dans Airtable
const airtableConversationService = {
  /**
   * Récupère les conversations associées à une propriété donnée.
   * @param propertyId - L'ID de la propriété à rechercher.
   * @returns Une liste de conversations formatées.
   */
  async fetchConversations(propertyId: string) {
    try {
      const records = await base('Conversations')
        .select({
          filterByFormula: `{Properties} = '${propertyId}'`,
          fields: ['Guest Name', 'Guest Email', 'Messages', 'Check-in Date', 'Check-out Date', 'Status', 'Platform'],
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
      console.error('Erreur lors de la récupération des conversations :', error);
      throw new Error('Impossible de récupérer les conversations.');
    }
  },

  /**
   * Ajoute une nouvelle conversation dans Airtable.
   * @param conversationData - Les données de la conversation à ajouter.
   * @returns La conversation créée avec son ID.
   */
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
      console.error('Erreur lors de l\'ajout de la conversation :', error);
      throw new Error('Impossible d\'ajouter la conversation.');
    }
  },

  /**
   * Supprime une conversation de Airtable.
   * @param conversationId - L'ID de la conversation à supprimer.
   * @returns Un objet indiquant le succès de l'opération.
   */
  async deleteConversation(conversationId: string) {
    try {
      await base('Conversations').destroy(conversationId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation :', error);
      throw new Error('Impossible de supprimer la conversation.');
    }
  },
};

// Export par défaut pour utilisation dans d'autres modules
export default airtableConversationService;

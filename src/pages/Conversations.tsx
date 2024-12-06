import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { conversationService } from '../services/conversationService';

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      console.log('➡️ Tentative de chargement des conversations');

      if (!propertyId) {
        console.error('❌ Aucun propertyId fourni dans l’URL.');
        setError('Aucun identifiant de propriété fourni.');
        setLoading(false);
        return;
      }

      try {
        console.log('➡️ Chargement des conversations pour la propriété ID:', propertyId);
        const data = await conversationService.fetchConversations(propertyId);
        console.log('✅ Conversations chargées avec succès:', data);

        if (!Array.isArray(data)) {
          console.warn('⚠️ Les données retournées ne sont pas un tableau:', data);
        }

        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('❌ Erreur lors du chargement des conversations:', errorMessage);
        setError(`Erreur : ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [propertyId]);

  if (loading) {
    // Affichage d'un spinner de chargement
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    // Affichage d'un message d'erreur
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        {propertyId && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {propertyId ? `Conversations de la propriété ${propertyId}` : 'Toutes les conversations'}
        </h1>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          // Aucune conversation trouvée
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
          </div>
        ) : (
          // Liste des conversations
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                console.log('🔗 Redirection vers la conversation ID:', conversation.id);
                navigate(`/chat/${conversation.id}`);
              }}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900">{conversation.guestName || 'Nom inconnu'}</h3>
              <p className="text-sm text-gray-500">
                {conversation.messages?.length || 0} messages
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Conversations;

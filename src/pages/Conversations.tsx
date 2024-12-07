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

  // Simulé : Remplacez par la logique réelle pour récupérer guestEmail
  const guestEmail = "test@example.com"; // TODO: Dynamiser cet email en fonction du contexte utilisateur

  useEffect(() => {
    const loadConversations = async () => {
      if (!propertyId || !guestEmail) {
        setError('Propriété ou email invité manquant.');
        setLoading(false);
        return;
      }

      try {
        const data = await conversationService.fetchConversations(propertyId, guestEmail);
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(`Erreur : ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [propertyId, guestEmail]);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
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
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Conversations
        </h1>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-gray-500">Il n'y a pas encore de conversations pour cette propriété.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => navigate(`/properties/${propertyId}/conversations/${conversation.id}`)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{conversation.guestName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(conversation.checkIn).toLocaleDateString()} - {new Date(conversation.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {conversation.messages?.length || 0} messages
                </span>
              </div>
              {conversation.messages?.length > 0 && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                  Dernier message : {conversation.messages[conversation.messages.length - 1].text}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Conversations;

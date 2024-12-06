import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { conversationService } from '../services/conversationService';

interface Message {
  id: string;
  text: string;
  isUser?: boolean;
  timestamp?: string;
  sender?: string;
}

interface Conversation {
  id: string;
  guestName?: string;
  messages?: Message[];
}

const ConversationDetail: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setError('Aucun conversationId fourni.');
        setLoading(false);
        return;
      }

      try {
        console.log('➡️ Chargement de la conversation ID:', conversationId);
        const data = await conversationService.fetchConversationById(conversationId);
        console.log('✅ Conversation récupérée :', data);
        setConversation(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('❌ Erreur lors du chargement de la conversation:', errorMessage);
        setError(`Erreur : ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!conversation) return <div className="p-6">Aucune conversation trouvée.</div>;

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
          Conversation avec {conversation.guestName || 'Invité inconnu'}
        </h1>
      </div>

      <ul className="space-y-4">
        {conversation.messages?.map((msg) => (
          <li key={msg.id} className="border border-gray-200 p-4 rounded-lg">
            <div className="font-medium text-gray-900">
              {msg.sender || (msg.isUser ? 'Vous' : 'Invité')}
            </div>
            <p className="text-gray-700">{msg.text}</p>
            {msg.timestamp && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationDetail;

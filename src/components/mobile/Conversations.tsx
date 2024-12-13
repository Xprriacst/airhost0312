import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { conversationService } from '../../services';
import ConversationList from '../../components/mobile/ConversationList';
import type { Conversation } from '../../types';

const MobileConversations: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = propertyId 
          ? await conversationService.fetchPropertyConversations(propertyId)
          : await conversationService.fetchAllConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [propertyId]);

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/chat/${conversation.id}`, { 
      state: { conversation }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {propertyId ? 'Conversations du logement' : 'Toutes les conversations'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default MobileConversations;

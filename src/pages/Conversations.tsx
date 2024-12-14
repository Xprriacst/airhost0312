import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import { conversationService } from '../services/conversationService';
import type { Conversation } from '../types';

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        let fetchedConversations;
        
        if (propertyId) {
          // Fetch conversations for specific property
          fetchedConversations = await conversationService.fetchPropertyConversations(propertyId);
        } else {
          // Fetch all conversations
          fetchedConversations = await conversationService.fetchAllConversations();
        }
        
        setConversations(fetchedConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [propertyId]);

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/properties/${conversation.propertyId}/conversations/${conversation.id}`);
  };

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
          {propertyId ? 'Property Conversations' : 'All Conversations'}
        </h1>
      </div>

      <ConversationList
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default Conversations;

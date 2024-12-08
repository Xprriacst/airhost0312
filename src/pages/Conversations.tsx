import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import useConversations from '../hooks/useConversations';

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const guestEmail = "pirouete@example.com"; // TODO: Get from auth context or props

  const { conversations, isLoading, error } = useConversations(propertyId!, guestEmail);

  const handleSelectConversation = (conversation: any) => {
    navigate(`/properties/${propertyId}/conversations/${conversation.id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
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

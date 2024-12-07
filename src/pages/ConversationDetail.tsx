import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { conversationService } from '../services/conversationService';
import ChatMessage from '../components/ChatMessage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
}

const ConversationDetail: React.FC = () => {
  const { propertyId, conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setError('Conversation ID is missing');
        setLoading(false);
        return;
      }

      try {
        const data = await conversationService.fetchConversationById(conversationId);
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
      sender: 'Host'
    };

    try {
      // Add message to conversation
      const updatedMessages = [...(conversation.messages || []), message];
      await conversationService.updateConversation(conversationId!, {
        messages: JSON.stringify(updatedMessages)
      });

      setConversation(prev => ({
        ...prev,
        messages: updatedMessages
      }));
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/properties/${propertyId}/conversations`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {conversation?.guestName || 'Guest'}
            </h1>
            <p className="text-sm text-gray-500">
              {conversation?.checkIn && new Date(conversation.checkIn).toLocaleDateString()} - {conversation?.checkOut && new Date(conversation.checkOut).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages?.map((message: Message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;

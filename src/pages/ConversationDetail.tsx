import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import { conversationService, messageService, propertyService } from '../services';
import ChatMessage from '../components/ChatMessage';
import type { Message, Property } from '../types';

const ConversationDetail: React.FC = () => {
  const { propertyId, conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<any>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!conversationId || !propertyId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const [convData, propData] = await Promise.all([
          conversationService.fetchConversationById(conversationId),
          propertyService.getPropertyById(propertyId)
        ]);

        setConversation(convData);
        setProperty(propData);
        setIsAutoPilot(propData?.autoPilot || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [conversationId, propertyId]);

  const handleToggleAutoPilot = async () => {
    if (!propertyId) return;

    try {
      const updatedProperty = await propertyService.toggleAutoPilot(propertyId, !isAutoPilot);
      if (updatedProperty) {
        setIsAutoPilot(updatedProperty.autoPilot || false);
      }
    } catch (err) {
      console.error('Failed to toggle auto-pilot:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
      sender: 'Host'
    };

    setSending(true);

    try {
      const updatedMessages = [...(conversation.messages || []), message];
      
      await conversationService.updateConversation(conversationId!, {
        Messages: JSON.stringify(updatedMessages)
      });

      await messageService.sendMessage(
        message,
        conversation.guestEmail,
        propertyId!
      );

      setConversation(prev => ({
        ...prev,
        messages: updatedMessages
      }));
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
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
        <div className="flex items-center justify-between mb-2">
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
          <button
            onClick={handleToggleAutoPilot}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isAutoPilot
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Zap className={`w-4 h-4 ${isAutoPilot ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {isAutoPilot ? 'Auto-pilot ON' : 'Auto-pilot OFF'}
            </span>
          </button>
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
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;

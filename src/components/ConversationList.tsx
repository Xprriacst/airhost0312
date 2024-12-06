import React from 'react';
import { ArrowLeft, MessageSquare, AlertTriangle, Wrench, Package, HelpCircle, AlertOctagon } from 'lucide-react';
import type { Property, Conversation, EmergencyTag } from '../types';

const EmergencyIcon = ({ tag }: { tag: EmergencyTag }) => {
  switch (tag) {
    case 'client_mecontent':
      return <AlertTriangle className="w-4 h-4 text-orange-500" title="Client mécontent" />;
    case 'probleme_technique':
      return <Wrench className="w-4 h-4 text-red-500" title="Problème technique" />;
    case 'probleme_stock':
      return <Package className="w-4 h-4 text-yellow-500" title="Problème de stock" />;
    case 'reponse_inconnue':
      return <HelpCircle className="w-4 h-4 text-blue-500" title="Réponse inconnue" />;
    case 'urgence':
      return <AlertOctagon className="w-4 h-4 text-red-600" title="Urgence" />;
    default:
      return null;
  }
};

interface ConversationListProps {
  property: Property;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onBack: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  property,
  conversations,
  onSelectConversation,
  onBack,
}) => {
  const propertyConversations = conversations.filter(c => c.propertyId === property.id);

  return (
    <div className="h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-sm text-gray-500">{propertyConversations.length} conversations</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {propertyConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{conversation.guestName}</h3>
                    {conversation.emergencyTags?.map((tag) => (
                      <EmergencyIcon key={tag} tag={tag} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(conversation.checkIn).toLocaleDateString()} - {new Date(conversation.checkOut).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {conversation.messages.length} messages
              </span>
            </div>
            {conversation.messages.length > 0 && (
              <div className="mt-3 text-left">
                <p className="text-sm text-gray-600 line-clamp-1">
                  Dernier message : {conversation.messages[conversation.messages.length - 1].text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conversation.messages[conversation.messages.length - 1].timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;

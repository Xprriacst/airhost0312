import React from 'react';
import { MessageSquare, AlertTriangle, Wrench, Package, HelpCircle, AlertOctagon } from 'lucide-react';
import type { Conversation, EmergencyTag } from '../../types';

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
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{conversation.guestName}</h3>
                {conversation.emergencyTags?.map((tag) => (
                  <EmergencyIcon key={tag} tag={tag} />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(conversation.checkIn).toLocaleDateString()} - {new Date(conversation.checkOut).toLocaleDateString()}
              </p>
            </div>
            {conversation.messages.length > 0 && (
              <span className="text-xs text-gray-500">
                {new Date(conversation.messages[conversation.messages.length - 1].timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          {conversation.messages.length > 0 && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {conversation.messages[conversation.messages.length - 1].text}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default ConversationList;

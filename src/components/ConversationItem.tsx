import React from 'react';
import { MessageSquare, AlertTriangle, Wrench, Package, HelpCircle, AlertOctagon } from 'lucide-react';
import type { Conversation, EmergencyTag } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

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

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const formattedDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors text-left"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{conversation.guestName}</h3>
              {conversation.emergencyTags?.map((tag) => (
                <EmergencyIcon key={tag} tag={tag} />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {formattedDate(conversation.checkIn)} - {formattedDate(conversation.checkOut)}
            </p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {conversation.messages.length} messages
        </span>
      </div>

      {lastMessage && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-1">
            Last message: {lastMessage.text}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(lastMessage.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </button>
  );
};

export default ConversationItem;

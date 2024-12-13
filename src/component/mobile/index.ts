import React from 'react';
import type { Conversation } from '../../types';
import EmergencyIcon from './EmergencyIcon';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <button
      onClick={onClick}
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
        {lastMessage && (
          <span className="text-xs text-gray-500">
            {new Date(lastMessage.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      {lastMessage && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {lastMessage.text}
        </p>
      )}
    </button>
  );
};

export default ConversationItem;

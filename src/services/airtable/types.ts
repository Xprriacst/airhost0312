import type { Message, Conversation } from '../../types';

export interface AirtableRecord {
  id: string;
  get: (field: string) => any;
}

export interface ConversationRecord extends AirtableRecord {
  fields: {
    Properties: string[];
    'Guest Name': string;
    'Guest Email': string;
    'Check-in Date': string;
    'Check-out Date': string;
    Messages: string;
    Status: string;
    Platform: string;
  };
}

export interface MessageData {
  text: string;
  sender: string;
  timestamp?: string | Date;
  isUser?: boolean;
}

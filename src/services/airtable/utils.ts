import type { Message } from '../../types';
import type { MessageData } from './types';

export const messageUtils = {
  parse(rawMessages: any): Message[] {
    try {
      return typeof rawMessages === 'string' 
        ? JSON.parse(rawMessages) 
        : rawMessages || [];
    } catch (error) {
      console.warn('⚠️ Invalid message format:', error);
      return [];
    }
  },

  create(data: MessageData): Message {
    return {
      id: Date.now().toString(),
      text: data.text,
      isUser: data.isUser ?? false,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      sender: data.sender
    };
  }
};

export const arrayUtils = {
  parseArray(value: any, separator = '\n'): string[] {
    if (Array.isArray(value)) return value;
    return (value || '').split(separator).filter(Boolean);
  }
};

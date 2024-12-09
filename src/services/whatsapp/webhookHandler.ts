import type { Message } from '../../types';

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text: {
    body: string;
  };
  type: string;
}

export interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
      };
      field: string;
    }>;
  }>;
}

export const extractMessageFromWebhook = (body: WhatsAppWebhook): Message | null => {
  try {
    const entry = body.entry[0];
    const change = entry.changes[0];
    const message = change.value.messages?.[0];
    
    if (!message) {
      return null;
    }

    return {
      id: message.id,
      text: message.text.body,
      isUser: false,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      sender: message.from
    };
  } catch (error) {
    console.error('Error extracting message from webhook:', error);
    return null;
  }
};

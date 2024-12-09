import axios from 'axios';
import type { Message } from '../../types';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN;

export const whatsappService = {
  async sendMessage(to: string, text: string): Promise<void> {
    try {
      await axios.post(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  },

  async sendTemplate(to: string, templateName: string, language: string = 'en'): Promise<void> {
    try {
      await axios.post(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to send WhatsApp template:', error);
      throw new Error('Failed to send WhatsApp template');
    }
  },

  validateWebhook(mode: string, token: string, challenge: string): string | null {
    const VERIFY_TOKEN = process.env.VITE_WHATSAPP_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  }
};

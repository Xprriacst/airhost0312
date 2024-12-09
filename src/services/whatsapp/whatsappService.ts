import { whatsappApi } from './api';
import { validateConfig } from './config';
import type { Message } from '../../types';

const config = validateConfig();

export const whatsappService = {
  async sendMessage(to: string, text: string): Promise<void> {
    try {
      await whatsappApi.sendMessage(to, text);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  },

  async sendTemplate(to: string, templateName: string, language: string = 'en'): Promise<void> {
    try {
      await whatsappApi.sendTemplate(to, templateName, language);
    } catch (error) {
      console.error('Failed to send WhatsApp template:', error);
      throw new Error('Failed to send WhatsApp template');
    }
  },

  validateWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === config.verifyToken) {
      return challenge;
    }
    return null;
  }
};

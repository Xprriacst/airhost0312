import axios from 'axios';
import { validateConfig } from './config';

const config = validateConfig();

export const whatsappApi = {
  async sendMessage(to: string, text: string) {
    return axios.post(
      `${config.apiUrl}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },

  async sendTemplate(to: string, templateName: string, language: string = 'en') {
    return axios.post(
      `${config.apiUrl}/${config.phoneNumberId}/messages`,
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
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

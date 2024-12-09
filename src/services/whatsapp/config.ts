import { z } from 'zod';

const whatsappConfigSchema = z.object({
  apiUrl: z.string().url(),
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
  verifyToken: z.string().min(1),
});

export type WhatsAppConfig = z.infer<typeof whatsappConfigSchema>;

// Helper to safely get environment variables
const getEnvVar = (key: string): string => {
  // For Vite/browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  // For Node.js environment (Netlify Functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const config = {
  apiUrl: 'https://graph.facebook.com/v17.0',
  phoneNumberId: getEnvVar('VITE_WHATSAPP_PHONE_NUMBER_ID'),
  accessToken: getEnvVar('VITE_WHATSAPP_ACCESS_TOKEN'),
  verifyToken: getEnvVar('VITE_WHATSAPP_VERIFY_TOKEN'),
};

export const validateConfig = (): WhatsAppConfig => {
  try {
    if (!config.phoneNumberId || !config.accessToken || !config.verifyToken) {
      throw new Error('Missing required WhatsApp configuration. Please check your environment variables.');
    }
    return whatsappConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid WhatsApp configuration:', error);
    throw new Error('WhatsApp configuration is invalid or missing required values');
  }
};

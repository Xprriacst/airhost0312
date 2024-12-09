import { z } from 'zod';

const whatsappConfigSchema = z.object({
  apiUrl: z.string().url(),
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
  verifyToken: z.string().min(1),
});

export type WhatsAppConfig = z.infer<typeof whatsappConfigSchema>;

const config = {
  apiUrl: 'https://graph.facebook.com/v17.0',
  phoneNumberId: process.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
  verifyToken: process.env.VITE_WHATSAPP_VERIFY_TOKEN || '',
};

export const validateConfig = (): WhatsAppConfig => {
  try {
    return whatsappConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid WhatsApp configuration:', error);
    throw new Error('WhatsApp configuration is invalid');
  }
};

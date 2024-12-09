import { z } from 'zod';

const envSchema = z.object({
  airtable: z.object({
    apiKey: z.string().min(1, 'Airtable API key is required'),
    baseId: z.string().min(1, 'Airtable Base ID is required'),
  }),
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
  }),
});

const getEnvVar = (key: string): string => {
  try {
    // Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
  } catch {
    // Ignore if import.meta is not available
  }

  // Node.js environment (Netlify Functions)
  if (typeof process !== 'undefined' && process.env) {
    // Handle Netlify environment variables (without VITE_ prefix)
    const netlifyKey = key.replace('VITE_', '');
    return process.env[key] || process.env[netlifyKey] || '';
  }

  return '';
};

export const env = {
  airtable: {
    apiKey: getEnvVar('VITE_AIRTABLE_API_KEY'),
    baseId: getEnvVar('VITE_AIRTABLE_BASE_ID'),
  },
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  },
};

export const validateEnv = () => {
  try {
    envSchema.parse(env);
    console.log('Environment variables are valid.');
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
};

export const isConfigValid = validateEnv();

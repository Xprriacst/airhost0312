import { z } from 'zod';

// Schema validation for environment variables
const envSchema = z.object({
  airtable: z.object({
    apiKey: z.string().min(1, 'Airtable API key is required'),
    baseId: z.string().min(1, 'Airtable Base ID is required'),
  }),
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
  }),
});

// Function to get environment variables based on context
const getEnvVar = (key: string): string => {
  // Node.js context (Netlify functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  // Browser context (Vite)
  return import.meta.env[key] || '';
};

// Environment variables object
export const env = {
  airtable: {
    apiKey: getEnvVar('AIRTABLE_API_KEY') || getEnvVar('VITE_AIRTABLE_API_KEY'),
    baseId: getEnvVar('AIRTABLE_BASE_ID') || getEnvVar('VITE_AIRTABLE_BASE_ID'),
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY') || getEnvVar('VITE_OPENAI_API_KEY'),
  },
};

// Validate environment configuration
const validateEnv = () => {
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

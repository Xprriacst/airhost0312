import { defaultConfig } from './defaults';
import { validateEnv, validateEnvVar } from './validation';
import type { EnvConfig } from './schema';

const getEnvVar = (key: string): string => import.meta.env[key] || '';

export const env: EnvConfig = {
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY') || defaultConfig.openai.apiKey,
  },
  airtable: {
    apiKey: getEnvVar('VITE_AIRTABLE_API_KEY') || defaultConfig.airtable.apiKey,
    baseId: getEnvVar('VITE_AIRTABLE_BASE_ID') || defaultConfig.airtable.baseId,
  },
  make: {
    webhookUrl: getEnvVar('VITE_MAKE_WEBHOOK_URL') || defaultConfig.make.webhookUrl,
    webhookSecret: getEnvVar('MAKE_WEBHOOK_SECRET') || defaultConfig.make.webhookSecret,
  },
};

// Validate environment variables
['VITE_OPENAI_API_KEY', 'VITE_AIRTABLE_API_KEY', 'VITE_AIRTABLE_BASE_ID', 'VITE_MAKE_WEBHOOK_URL']
  .forEach(key => validateEnvVar(key, getEnvVar(key)));

// Validate entire configuration
validateEnv(env);

export type { EnvConfig } from './schema';
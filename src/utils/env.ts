/**
 * Safely retrieves environment variables across different environments
 */
export const getEnvVar = (key: string): string => {
  try {
    // Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
  } catch {
    // Ignore if import.meta is not available
  }

  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    // Handle Netlify environment variables (without VITE_ prefix)
    const netlifyKey = key.replace('VITE_', '');
    return process.env[key] || process.env[netlifyKey] || '';
  }

  return '';
};

/**
 * Validates that all required environment variables are present
 */
export const validateEnv = (requiredVars: string[]): boolean => {
  const missing = requiredVars.filter(key => !getEnvVar(key));
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

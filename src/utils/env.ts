export const getEnvVar = (key: string): string => {
  return import.meta.env[key] || '';
};
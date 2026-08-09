const configuredServerUrl = import.meta.env.VITE_SERVER_URL;

if (import.meta.env.PROD && !configuredServerUrl) {
  throw new Error(
    'Production configuration error: VITE_SERVER_URL is not defined.'
  );
}

// Normalize the URL by removing trailing slash
let normalizedUrl = configuredServerUrl ? configuredServerUrl.replace(/\/$/, '') : 'http://localhost:5000';

export const API_URL = normalizedUrl;

if (import.meta.env.DEV) {
  console.log('[BuzzArena] API Server:', API_URL);
}

const configuredServerUrl = import.meta.env.VITE_SERVER_URL;

// If VITE_SERVER_URL is missing in production, fallback to the actual Render backend
// rather than crashing the app.
const fallbackUrl = import.meta.env.PROD 
  ? 'https://buzzarena.onrender.com' 
  : 'http://localhost:5000';

const targetUrl = configuredServerUrl || fallbackUrl;

// Normalize the URL by removing trailing slash
let normalizedUrl = targetUrl.replace(/\/$/, '');

export const API_URL = normalizedUrl;

if (import.meta.env.DEV) {
  console.log('[BuzzArena] API Server:', API_URL);
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
  throw new Error(
    'VITE_SERVER_URL is not configured. Set it in the environment before starting BuzzArena.'
  );
}

export const API_URL = SERVER_URL.replace(/\/$/, '');

if (import.meta.env.DEV) {
  console.log('[BuzzArena] API Server:', API_URL);
}

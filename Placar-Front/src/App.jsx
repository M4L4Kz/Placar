// Forçando a URL correta direto no código
export const BACKEND_URL = 'https://breaking-battles-api.onrender.com';

export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});
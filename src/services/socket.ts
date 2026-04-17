import { io } from 'socket.io-client';

// Detectar entorno: En local, el servidor suele estar en el 3001
const isLocal = window.location.hostname === 'localhost';
const SOCKET_URL = isLocal ? 'http://localhost:3001' : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  transports: ['websocket', 'polling']
});

// Helper para depuración
socket.on('connect', () => {
  console.log('Conectado al servidor de Sockets Artemis:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Error de conexión Socket:', err);
});

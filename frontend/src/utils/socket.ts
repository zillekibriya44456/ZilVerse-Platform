import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  timeout: 10000
});

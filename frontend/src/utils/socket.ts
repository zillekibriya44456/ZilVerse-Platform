import { API_BASE } from "@/utils/api";
import { io } from 'socket.io-client';

const SOCKET_URL = `${API_BASE}`;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  timeout: 10000
});

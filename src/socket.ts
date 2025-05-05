import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/server.ts'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()

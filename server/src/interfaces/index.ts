export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface ServerToClientEvents {
  join: (data: { roomId: string; socketId: string; user: User }) => void;
  left: (data: { socketId: string; user: User }) => void;
  message: (data: { message: string; user: User; socketId: string }) => void;
}

export interface ClientToServerEvents {
  message: (data: { message: string; user: User }, socketId: string) => void;
  join: (data: { roomId: string; user: User }) => void;
  leave: (userId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

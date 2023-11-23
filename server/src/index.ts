import "colors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  User,
} from "./interfaces";

const app = express();

const PORT = 5000;

const server = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "*",
  },
});

const users = new Map<string, User>();

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`.green);

  socket.once("join", ({ roomId, user }) => {
    // set user on the users map
    users.set(socket.id, user);

    // join to the room
    socket.join(roomId);
    socket.broadcast.emit("join", { roomId, socketId: socket.id, user });
  });

  socket.on("message", ({ user, message }) => {
    socket.broadcast.emit("message", { message, user, socketId: socket.id });
  });

  socket.on("leave", (roomId) => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("left", {
        socketId: socket.id,
        user: users.get(socket.id) as User,
      });

      // remove user from map
      users.delete(socket.id);
      socket.leave(roomId);
      console.log(`socket ${socket.id} disconnected`.red);
    }
  });

  socket.on("disconnect", ({}) => {
    const user = users.get(socket.id);

    if (user) {
      socket.broadcast.emit("left", {
        socketId: socket.id,
        user: users.get(socket.id) as User,
      });

      // remove user from map
      users.delete(socket.id);
      console.log(`socket ${socket.id} disconnected`.red);
    }
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});

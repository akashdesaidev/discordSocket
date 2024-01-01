const express = require("express");
require('dotenv').config(); 
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Use the cors middleware

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Authorization",
  },
});
const PORT =process.env.PORT||3001;
const activeUsers = new Set();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId === undefined) return;
  console.log(userId);
  activeUsers.add(userId);

  io.emit("setOnline", Array.from(activeUsers));

  socket.on("sendMessage", async (data) => {
    const { conversationId, sender, message } = data;
    const conversationKey = `chat:${conversationId}:message`;
    console.log(message, sender, conversationId, conversationKey);

    io.to(conversationId).emit(conversationKey, message);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(userId);
    io.emit("setOnline", Array.from(activeUsers));
  });
});

server.listen(PORT, () => {
  console.log(`Socket.IO server listening on ${PORT}`);
});
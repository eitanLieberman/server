const express = require("express");

const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("socket connect");
  socket.on("disconnect", () => {
    console.log("user had left socket.io");
  });
});

app.use(router);
server.listen(PORT, () => {
  console.log("server running " + PORT);
});

const express = require("express");

const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, () => {
  console.log("server running " + PORT);
});

const express = require("express");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const { chats } = require("./data/data");
const PORT = process.env.PORT || 8080;
const router = require("./router");
const app = express();
const mongoose = require("mongoose");
dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const chatRoute = require("./routes/chat");

const messageRoute = require("./routes/message");
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB great success"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.get("/", (req, res) => {
  res.send("api running!");
});

app.use(router);
const server = app.listen(PORT, () => {
  console.log("server running " + PORT);
});

const io = require("socket.io")(server, {
  pingTimeOut: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      console.log(user);
      console.log(newMessageReceived.sender);
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

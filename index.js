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
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB great success"))
  .catch((err) => {
    console.log(err);
  });
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.get("/", (req, res) => {
  res.send("api running!");
});

app.use(router);
app.listen(PORT, () => {
  console.log("server running " + PORT);
});

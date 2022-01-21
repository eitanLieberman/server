const Chat = require("../models/chat");
const User = require("../models/user");
const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

router.post("/", verifyToken, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400);
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },

      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };
    try {
      const createChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (err) {
      res.json(err);
    }
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const findChat = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    const result = await User.populate(findChat, {
      path: "latestMessage.sender",
      select: "username pic email",
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

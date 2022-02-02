const Chat = require("../models/chat");
const User = require("../models/user");
const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//start/access a chat
router.post("/", verifyToken, async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
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
    return;
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
      console.log("done");
      res.status(200).send(FullChat);
    } catch (err) {
      res.json(err);
    }
  }
});

//display all user chats
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log(req.user);
    const findChat = await Chat.find({
      users: { $elemMatch: { $eq: req.user?.id || req.user?._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    const result = await User.populate(findChat, {
      path: "latestMessage.sender",
      select: "username pic email",
    });
    // console.log(result);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
  }
});

//create a group chat
router.post("/group", verifyToken, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user.id,
    });

    console.log(groupChat);
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400).json(err);
  }
});

//change chat name

router.put("/rename", verifyToken, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.body.chatId,

      {
        chatName: req.body.chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(updatedChat);
  } catch (err) {
    res.status(400).json(err);
  }
});

//remove from chat

router.put("/remove", verifyToken, async (req, res) => {
  const { chatId, userId } = req.body;

  const targetChat = await Chat.findById(chatId);

  if (req.user.id !== targetChat.groupAdmin.toString()) {
    res.status(404);
    throw new Error("not group admin");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(201).json(removed);
});

router.put("/invite", verifyToken, async (req, res) => {
  const { chatId, userId } = req.body;

  const targetChat = await Chat.findById(chatId);
  //can't add a user who is already in group
  targetChat.users.forEach((user) => {
    if (user.toString() === userId) {
      res.status(400).json("already in group");
    }
  });

  if (req.user.id !== targetChat.groupAdmin.toString()) {
    res.status(404).json("not group admin");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(201).json(removed);
});

//LEAVE CHAT
router.put("/leave", verifyToken, async (req, res) => {
  const { chatId } = req.body;

  const targetChat = await Chat.findById(chatId);

  console.log(targetChat.users);
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: req.user.id },
      groupAdmin: targetChat.users[0],
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(201).json(removed);
});

module.exports = router;

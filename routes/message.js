const Chat = require("../models/chat");
const User = require("../models/user");
const Message = require("../models/message");
const router = require("../router");
const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
} = require("./verifyToken");
//get all messages
router.get("/:chatId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
//send a message
router.post("/", verifyToken, async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };
  console.log(newMessage);
  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic"); //.execPopulate();
    message = await message.populate("chat"); //.execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "username pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = router;

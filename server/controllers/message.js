import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
export const allMessages = async (req, res) => {
  try {
    console.log(req.params);
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName lastName picturePath email")
      .populate("chat");
    await Chat.findByIdAndUpdate(req.params.chatId, { seen: true });
    res.json(messages);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  // console.log(chatId);
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  console.log(req._id);
  var newMessage = {
    sender: req._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName picturePath")
      .populate("chat")
      .populate({
        path: "chat.users",
        select: "firstName lastName picturePath email",
      })
      .exec();

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: populatedMessage,
      seen: false,
    });

    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json(error);
  }
};

const { Message } = require("../models/message.model");

const MessageController = {
  getMessages: async (req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 });
      res.json({ success: true, count: messages.length, data: messages });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching messages" });
    }
  },
  deleteMessage: async (req, res) => {
    try {
      await Message.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Message deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error deleting message" });
    }
  },
};

module.exports = MessageController;

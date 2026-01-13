const { Message } = require("../models/message.model");

const ContactController = {
  sendMessage: async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      await Message.create({ name, email, message });
      res
        .status(201)
        .json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to send message." });
    }
  },
};

module.exports = ContactController;

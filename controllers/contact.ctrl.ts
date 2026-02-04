import { Request, Response } from "express";
import { db } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

const ContactController = {
  sendMessage: async (req: Request, res: Response) => {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      await db.message.create({
        data: {
          name,
          email,
          message,
        },
      });

      // Attempt to send email, but don't fail the request if it fails
      try {
        await sendContactEmail({ name, email, message });
      } catch (emailError) {
        console.error("Failed to send contact email:", emailError);
      }

      res.status(201).json({ success: true, message: "Sent" });
    } catch (err) {
      console.error("Contact Error:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
};

export default ContactController;

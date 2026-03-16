import { Request, Response } from "express";
import { db } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";
import logger from "@/utils/logger";

const ContactController = {
  sendMessage: async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        message,
        "cf-turnstile-response": turnstileToken,
      } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (!turnstileToken) {
        return res
          .status(400)
          .json({ success: false, message: "Captcha token is required" });
      }

      // Verify the token with Cloudflare
      const RECAPTCHA_SECRET_KEY =
        process.env.TURNSTILE_SECRET_KEY ||
        "1x0000000000000000000000000000000AA"; // Dummy for testing
      const verificationResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `secret=${RECAPTCHA_SECRET_KEY}&response=${turnstileToken}`,
        },
      );

      const verificationResult = (await verificationResponse.json()) as {
        success: boolean;
      };

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Captcha verification failed. Please try again.",
        });
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
        logger.warn("Failed to send contact email", {
          error: (emailError as Error).message,
        });
      }

      res.status(201).json({ success: true, message: "Sent" });
    } catch (err) {
      logger.error("Contact Error", { error: (err as Error).message });
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
};

export default ContactController;

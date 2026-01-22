// lib/email.js - Email service integration
const { Resend } = require("resend");
const { UserAcknowledge, AdminAcknowledge } = require("./emailTempletes");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resend;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn(
    "⚠️ RESEND_API_KEY is missing. Email notifications will be disabled."
  );
}

/**
 *
 * @param {name} param0 Name of the user
 * @param {email} param1 Email of the user
 * @param {message} param2 Message from the user
 * @param {ip} param3 Ip of the user optional
 */
async function sendContactEmail({ name, email, message, ip = "" }) {
  try {
    console.log("Mail Data", {
      name,
      email,
      message,
      ip,
    });
    // TODO: Change the verified mail
    const portfolioHolder = await resend.emails.send({
      from: "Admin <website@resend.dev>", // Use your verified domain
      to: "nagarjun.avala.official@gmail.com",
      subject: `New Contact Form Message from ${name}`,
      html: AdminAcknowledge({ name, message, email, ip }),
    });

    // Send confirmation email to the sender
    const portfolioUser = await resend.emails.send({
      from: "Website <website@resend.dev>",
      to: email,
      subject: "Thanks for reaching out!",
      html: UserAcknowledge({ name }),
    });
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
}

module.exports = { sendContactEmail };

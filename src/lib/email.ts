import { Resend } from "resend";
import { UserAcknowledge, AdminAcknowledge } from "@/lib/emailTempletes";
import logger from "@/utils/logger";

let resend: Resend | null = null;
let isInitialized = false;

const getResendClient = () => {
  if (isInitialized) return resend;

  const API_KEY = process.env.RESEND_API_KEY;
  if (API_KEY) {
    resend = new Resend(API_KEY);
  } else {
    logger.warn(
      "⚠️ RESEND_API_KEY is missing. Email notifications will be disabled.",
    );
  }
  isInitialized = true;
  return resend;
};

interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
  ip?: string;
}

/**
 * Sends contact form emails to both the admin and the user.
 * @param params - The contact form data.
 */
export async function sendContactEmail({
  name,
  email,
  message,
  ip = "",
}: SendContactEmailParams): Promise<void> {
  const client = getResendClient();

  // If Resend is not initialized, log a warning and return early to prevent errors
  if (!client) {
    logger.warn("Email service not initialized. Skipping email sending.");
    return;
  }

  try {
    logger.info("Sending mail data", {
      emailData: { name, email, message, ip },
    });

    // Send notification to the portfolio owner (Admin)
    await client.emails.send({
      from: "Admin <website@resend.dev>", // TODO: Update with your verified domain in production
      to: "nagarjun.avala.official@gmail.com",
      subject: `New Contact Form Message from ${name}`,
      html: AdminAcknowledge({ name, message, email, ip }),
    });

    // Send acknowledgment email to the user who filled the form
    await client.emails.send({
      from: "Website <website@resend.dev>", // TODO: Update with your verified domain in production
      to: email,
      subject: "Thanks for reaching out!",
      html: UserAcknowledge({ name }),
    });

    logger.success("Emails sent successfully.");
  } catch (error) {
    logger.error("Email send error", { error: (error as Error).message });
    // Re-throw or handle gracefully depending on requirements.
    // Usually, we don't want to fail the HTTP request just because the email failed,
    // but logging it is crucial.
    throw new Error("Failed to send email");
  }
}

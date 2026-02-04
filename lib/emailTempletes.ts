interface UserAcknowledgeProps {
    name: string;
    designation?: string;
}

export const UserAcknowledge = ({
    name,
    designation = "Digital Designer & Developer",
}: UserAcknowledgeProps): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Received</title>
    <style>
        /* Reset */
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; background-color: #f4f4f4; }
        body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 1.5; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }

        /* Typography */
        body, td, th { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }

        /* Mobile */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 30px 20px !important; }
            .heading-text { font-size: 32px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; color: #000000;">

    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
        I've received your message. Here is what happens next.
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Main Container -->
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0;">
                    
                    <!-- Top Accent Bar -->
                    <tr>
                        <td style="background-color: #000000; height: 8px;"></td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 50px 50px 30px 50px; text-align: left;">
                            
                            <!-- Eyebrow Text -->
                            <p style="margin: 0 0 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #888888;">
                                Status: Received
                            </p>

                            <!-- Headline -->
                            <h1 class="heading-text" style="margin: 0 0 30px 0; font-size: 42px; line-height: 1.1; font-weight: 800; color: #000000; letter-spacing: -1px;">
                                We'll be in<br>touch soon.
                            </h1>

                            <!-- Divider -->
                            <div style="width: 40px; height: 4px; background-color: #000000; margin-bottom: 30px;"></div>

                            <!-- Body Text -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                Thank you for contacting me. This email confirms that your message has been received and is currently in my queue.
                            </p>
                            <p style="margin: 0 0 40px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                I review all inquiries personally and aim to respond within <strong>24 hours</strong>. While you wait, you can view my latest work via the link below.
                            </p>

                            <!-- Square Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="background-color: #000000;">
                                        <a href="#" target="_blank" style="background-color: #000000; border: 2px solid #000000; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 15px 30px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                                            View Portfolio
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="content-padding" style="padding: 40px 50px; border-top: 1px solid #eeeeee;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="vertical-align: top;">
                                        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #000000;">
                                            ${name}
                                        </p>
                                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666666;">
                                            ${designation}
                                        </p>
                                    </td>
                                    <td align="right" style="vertical-align: top;">
                                        <p style="margin: 0; font-size: 12px; color: #999999;">
                                            &copy; ${new Date().toLocaleString()}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                
                <div style="height: 40px;">&nbsp;</div>

            </td>
        </tr>
    </table>

</body>
</html>`;
};

interface AdminAcknowledgeProps {
    name: string;
    email: string;
    subject?: string;
    message: string;
    ip?: string;
}

export const AdminAcknowledge = ({
    name,
    email,
    subject = "",
    message,
    ip = "",
}: AdminAcknowledgeProps): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead Notification</title>
    <style>
        /* Base */
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; background-color: #f1f5f9; }
        body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 1.5; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }

        /* Typography */
        body, td, th { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; }

        /* Mobile */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 24px 20px !important; }
            .header-text { font-size: 20px !important; }
            .col-split { display: block !important; width: 100% !important; padding-bottom: 20px; }
            .col-split:last-child { padding-bottom: 0; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #334155;">

    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
        New lead: ${name} - ${subject}
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Main Card -->
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    
                    <!-- Top Navigation-like Bar -->
                    <tr>
                        <td style="padding: 20px 32px; border-bottom: 1px solid #e2e8f0;">
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <span style="font-weight: 700; color: #0f172a; font-size: 16px;">PortfolioBot</span>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: #ecfccb; color: #4d7c0f; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;">Active</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Header Content -->
                    <tr>
                        <td class="content-padding" style="padding: 32px 32px 20px 32px;">
                            <h1 class="header-text" style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                                New Contact Submission
                            </h1>
                            <p style="margin: 0; font-size: 14px; color: #64748b;">
                                You have received a new message via the contact form.
                            </p>
                        </td>
                    </tr>

                    <!-- Info Grid -->
                    <tr>
                        <td class="content-padding" style="padding: 0 32px 32px 32px;">
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        
                                        <!-- Row 1: Name & Email -->
                                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td class="col-split" width="50%" valign="top" style="padding-right: 10px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Name</p>
                                                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">${name}</p>
                                                </td>
                                                <td class="col-split" width="50%" valign="top">
                                                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Email Address</p>
                                                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #4f46e5;">
                                                        <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        ${subject &&
            subject !== ""
            ? `<!-- Row 2: Subject -->
                                        <div style="margin-bottom: 24px;">
                                            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Subject</p>
                                            <p style="margin: 0; font-size: 15px; font-weight: 500; color: #1e293b;">${subject}</p>
                                        </div>`
            : ""
        }

                                        ${ip &&
            ip !== ""
            ? `
                                        <!-- Row 3: IP Address (Conditional) -->
                                        <div style="margin-bottom: 24px;">
                                            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">IP Address</p>
                                            <p style="margin: 0; font-size: 15px; font-weight: 500; color: #1e293b;">${ip}</p>
                                        </div>`
            : ""
        }

                                        <!-- Row 3: Message -->
                                        <div>
                                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Message Body</p>
                                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px;">
                                                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155;">
                                                    "${message}"
                                                </p>
                                            </div>
                                        </div>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td class="content-padding" style="padding: 0 32px 40px 32px; text-align: left;">
                             <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #0f172a;">
                                        <a href="mailto:${email}" style="background-color: #0f172a; border: 1px solid #0f172a; font-family: sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                                            Reply via Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                This is an automated notification. <a href="#" style="color: #64748b; text-decoration: underline;">Configure notifications</a>.
                            </p>
                        </td>
                    </tr>

                </table>
                
                <div style="height: 40px;">&nbsp;</div>

            </td>
        </tr>
    </table>

</body>
</html>`;
};
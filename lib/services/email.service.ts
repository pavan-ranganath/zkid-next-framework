// Importing the necessary dependencies and modules

import nodemailer from "nodemailer"; // Importing the 'nodemailer' module for sending emails
import SmtpTransport from "nodemailer/lib/smtp-transport"; // Importing the 'SmtpTransport' module from 'nodemailer/lib/smtp-transport' for SMTP transport configuration

const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      type: process.env.SMTP_AUTH_TYPE,
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: process.env.EMAIL_FROM,
};

// The 'nodemailer' module is used for sending emails. It provides a convenient API for configuring and sending emails using different transport methods.

// The 'SmtpTransport' module is imported from 'nodemailer/lib/smtp-transport'. It represents the SMTP transport method for sending emails using the SMTP protocol.

// The 'emailConfig' object contains the SMTP configuration and the "from" address for the emails. It retrieves the necessary configuration values from environment variables.

/**
 * Send an email
 *
 * This function sends an email using the configured SMTP transport.
 * It creates a transport instance using the SMTP configuration from 'emailConfig'.
 * The transport connection is verified, and if successful, a message is logged.
 * If the transport connection fails, an error is logged and an exception is thrown.
 * The email message is created with the 'from', 'to', 'subject', and 'text' fields.
 * The email is then sent using the transport's 'sendMail' method.
 * If an error occurs during sending, an error is logged and an exception is thrown.
 * If sending is successful, the accepted, rejected, and pending recipients are logged,
 * along with the message ID and a preview URL (if available).
 *
 * @param {string} to - The email address of the recipient
 * @param {string} subject - The subject of the email
 * @param {string} text - The text content of the email
 * @returns {Promise<any>}
 */
export const sendEmail = async (to: any, subject: string, text: string, html: string): Promise<any> => {
  const transport = nodemailer.createTransport(new SmtpTransport(emailConfig.smtp as any));

  transport
    .verify()
    .then(() => console.info("Connected to email server"))
    .catch((e) => {
      console.error(e);
      console.warn("Unable to connect to email server. Make sure you have configured the SMTP options in .env");
      throw new Error("Unable to connect to email server. Make sure you have configured the SMTP options in .env");
    });

  const msg = { from: emailConfig.from, to, subject, html, text };

  transport.sendMail(msg, (err, info: SmtpTransport.SentMessageInfo) => {
    if (err) {
      console.log(err);
      throw new Error(err.message);
    }
    console.log(info.accepted, info.rejected, info.pending);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};

/**
 * Send verification email
 *
 * This function sends a verification email to the specified recipient.
 * It generates the email subject and content with the verification URL.
 * The 'sendEmail' function is called to send the email.
 *
 * @param {string} to - The email address of the recipient
 * @param {string} token - The verification token
 * @returns {Promise<any>}
 */
export const sendVerificationEmail = async (to: any, token: any): Promise<any> => {
  const subject = "Email Verification";
  const verificationEmailUrl = `${process.env.NEXTAUTH_URL}/verification?token=${token}`;
  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .title {
          color: #007bff;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">Dear user,</h1>
        <p class="message">Thank you for creating an account with ZKID! Please verify your email address by clicking on the button below:</p>
        <a href="${verificationEmailUrl}" class="button">Verify Email</a>
        <p class="message">By verifying your email, you will have access to all the features and benefits of our platform.</p>
        <p class="message">If you did not create an account, then please ignore this email.</p>
        <p class="message">Best regards,<br/>The ZKID Team</p>
      </div>
    </body>
  </html>
`;

  await sendEmail(to, subject, "", html);
};

// The email sending functions 'sendVerificationEmail' are defined.
// These functions generate the email subject and content based on the provided tokens and URLs,
// and then call the 'sendEmail' function to send the email.

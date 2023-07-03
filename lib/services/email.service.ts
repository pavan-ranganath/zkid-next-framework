import nodemailer from "nodemailer";
import SmtpTransport from "nodemailer/lib/smtp-transport";

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

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
export const sendEmail = async (to: any, subject: string, text: string): Promise<any> => {
  const transport = nodemailer.createTransport(new SmtpTransport(emailConfig.smtp as any));
  /* istanbul ignore next */
  transport
    .verify()
    .then(() => console.info("Connected to email server"))
    .catch((e) => {
      console.error(e);
      console.warn("Unable to connect to email server. Make sure you have configured the SMTP options in .env");
      throw new Error("Unable to connect to email server. Make sure you have configured the SMTP options in .env");
    });
  const msg = { from: emailConfig.from, to, subject, text };
  transport.sendMail(msg, (err, info: SmtpTransport.SentMessageInfo) => {
    if (err) {
      console.log(err);
      throw new Error(err.message);
    }
    console.log(info.accepted, info.rejected, info.pending);
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendRegisterNewDevice = async (to: any, token: any): Promise<any> => {
  const subject = "Reset password";
  // replace this url with the link to the reset password page of your front-end app
  const registerNewDeviceUrl = `${process.env.NEXTAUTH_URL}/account/reset-password?token=${token}`;
  const text = `Dear user,
To register new device, open this link on new device: ${registerNewDeviceUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendVerificationEmail = async (to: any, token: any): Promise<any> => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${process.env.NEXTAUTH_URL}/verification?token=${token}`;
  const text = `Dear user,
Welcome to ZKID
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

import nodemailer from "nodemailer";
import { MailInterface } from "../lib/interfaces/mailInterface";
import Logging from "../lib/Logging";

export const sendEmail = async (options: MailInterface) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_TLS === "yes" ? true : false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: `"Arkar Phyo | Pos System" ${
      process.env.SMTP_SENDER || options.from
    }`,
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  const res = await transporter.sendMail(mailOptions);
  if (res) {
    Logging.info(`Mail sent successfully!!`);
    Logging.info(`[MailResponse]=${res.response} [MessageID]=${res.messageId}`);
  }
  return res;
};

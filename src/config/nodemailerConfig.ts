import nodemailer from "nodemailer";
import { MailInterface } from "../lib/interfaces/mailInterface";
import Logging from "../lib/Logging";
import prisma from "../lib/prisma";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_SENDER,
  SMTP_TLS,
  SMTP_USERNAME,
} from ".";

export const sendEmail = async (options: MailInterface) => {
  try {
    const smtpData = await prisma.siteSettings.findMany({
      where: {
        tag: "smtp",
      },
      select: {
        optionName: true,
        optionValue: true,
      },
    });
    const assign: Record<string, string> = {};
    smtpData.forEach(({ optionName, optionValue }) => {
      assign[optionName] = optionValue;
    });
    const transporter = nodemailer.createTransport({
      host: smtpData.length ? assign.host : SMTP_HOST,
      port: smtpData.length ? Number(assign.port) : Number(SMTP_HOST),
      secure: smtpData.length ? Boolean(assign.tls) : Boolean(SMTP_TLS),
      auth: {
        user: smtpData.length ? assign.username : SMTP_USERNAME,
        pass: smtpData.length ? assign.password : SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: `${smtpData.length ? "Arkar Phyo | Pos System" : "Pos System"} ${
        smtpData.length ? assign.sender : SMTP_SENDER || options.from
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
      Logging.info(
        `[MailResponse]=${res.response} [MessageID]=${res.messageId}`
      );
    }
    return res;
  } catch (error) {
    Logging.error(error);
  }
  return;
};

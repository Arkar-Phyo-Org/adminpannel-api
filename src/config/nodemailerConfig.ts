import nodemailer from "nodemailer";
import { MailInterface } from "../lib/interfaces/mailInterface";
import Logging from "../lib/Logging";
import prisma from "../lib/prisma";

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
    if (smtpData) {
      const assign: Record<string, string> = {};
      smtpData.forEach(({ optionName, optionValue }) => {
        assign[optionName] = optionValue;
      });
      const transporter = nodemailer.createTransport({
        host: assign.host,
        port: Number(assign.port),
        secure: Boolean(assign.tls),
        auth: {
          user: assign.username,
          pass: assign.password,
        },
      });
      const mailOptions = {
        from: `"Arkar Phyo | Pos System" ${assign.sender || options.from}`,
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
    }
  } catch (error) {
    Logging.error(error);
  }
  return;
};

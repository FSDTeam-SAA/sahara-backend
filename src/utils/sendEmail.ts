/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import nodemailer from 'nodemailer';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // e.g. "smtp.gmail.com"
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await transporter.sendMail({
    from: `"Website Contact" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

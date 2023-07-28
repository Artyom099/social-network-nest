import nodemailer from 'nodemailer';
import { settings } from '../utils/settings';

export const emailAdapter1 = {
  async sendEmail(to: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        // host: 'smtp.gmail.com',
        // port: 587,
        secure: true,
        auth: {
          user: settings.GMAIL_LOGIN,
          pass: settings.GMAIL_PASSWORD,
        },
      });
      return await transporter.sendMail({
        from: `"Blog Platform" <${settings.GMAIL_LOGIN}>`,
        to: to,
        subject: subject,
        html: message,
      });
    } catch (e) {
      console.error('Mail sending failed');
      console.error(e);
    }
  },
};

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = await nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: settings.MAIL_LOGIN,
        pass: settings.MAIL_PASSWORD,
      },
    });
    return await transporter.sendMail({
      from: `"Fred Foo 👻" <${settings.MAIL_LOGIN}>`, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    });
  },
};

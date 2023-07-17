import { emailAdapter } from './email.adapter';

export const emailManager = {
  async sendEmailConfirmationMessage(email: string, code: string) {
    const subject = 'Confirm your email';
    const message =
      ' <h1>Thank for your registration</h1>\n' +
      ' <p>To finish registration please follow the link below:\n' +
      `     <a href =\'https://somesite.com/confirm-email?code=${code}\'>complete registration</a>\n` +
      ' </p>\n';
    await emailAdapter.sendEmail(email, subject, message);
  },

  async sendEmailRecoveryCode(email: string, code: string) {
    const subject = 'Password recovery';
    const message = ` <h1>Password recovery</h1>
      <p>To finish password recovery please follow the link below:
          <a href =\'https://somesite.com/password-recovery?recoveryCode=${code}\'>recovery password</a>
      </p>`;
    await emailAdapter.sendEmail(email, subject, message);
  },
};

export const settings = {
  JWT_SECRET: process.env.JWT_SEKRET || '123',
  GMAIL_LOGIN: 'developbackend1@gmail.com',
  GMAIL_PASSWORD: 'qofjqroidyuosfxz',
  MAIL_LOGIN: 'artyom.dev@mail.ru',
  MAIL_PASSWORD: '3VLABWWkQsUXVJW7vJ8j',
};
export const jwtConstants = {
  accessSecret: 'SECRET_KEY',
  refreshSecret: 'SECRET_KEY',
};

export const basicAuthConstants = {
  userName: process.env.SA_LOGIN || 'admin',
  password: process.env.SA_PASSWORD || 'qwerty',
};

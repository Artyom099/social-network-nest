export const jwtConstants = {
  secret: 'SECRET_KEY',
};

export const basicAuthConstants = {
  userName: process.env.SA_LOGIN || 'admin',
  password: process.env.SA_PASSWORD || 'qwerty',
};

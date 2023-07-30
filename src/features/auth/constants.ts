export const jwtConstants = {
  accessSecret: 'SECRET_KEY',
  refreshSecret: 'REFRESH_TOKEN_SECRET_KEY',
};

export const basicAuthConstants = {
  userName: process.env.SA_LOGIN || 'admin',
  password: process.env.SA_PASSWORD || 'qwerty',
};

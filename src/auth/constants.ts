export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

export const basicConstants = {
  userName: process.env.SA_LOGIN || 'admin',
  password: process.env.SA_PASSWORD || 'qwerty',
};

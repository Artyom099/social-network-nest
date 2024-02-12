export const getRefreshTokenByResponseWithTokenName = (response: {
  headers: { [x: string]: string[] };
}) => {
  return response.headers['set-cookie'][0].split(';')[0];
};

export const getRefreshTokenByResponse = (response: {
  headers: { [x: string]: string[] };
}) => {
  return response.headers['set-cookie'][0].split(';')[0].split('=')[1];
};

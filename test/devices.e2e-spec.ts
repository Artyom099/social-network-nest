import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import request from 'supertest';
import { getRefreshTokenByResponseWithTokenName } from '../src/infrastructure/utils/utils';

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('DevicesController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();

    server = app.getHttpServer();
    await request(server).delete('/testing/all-data');
  });

  // создаю пользователя
  it('1 – POST:/users – return 201 & create user by admin', async () => {
    const password1 = 'qwerty1';
    const createResponse = await request(server)
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'lg-111111',
        password: password1,
        email: 'valid1-email@mail.ru',
      });

    expect(createResponse.status).toBe(HttpStatus.CREATED);
    const createdUser1 = createResponse.body;
    expect(createdUser1).toEqual({
      id: expect.any(String),
      login: createdUser1.login,
      email: createdUser1.email,
      createdAt: expect.any(String),
    });

    await request(server)
      .get('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUser1],
      });

    expect.setState({ createdUser1, password1 });
  });
  // логиню его с 4х девайсов
  it('2 – POST:/auth/login – return 200 & login 1st user – 1st device', async () => {
    const { createdUser1, password1 } = expect.getState();

    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-1')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    // почему в headers нет 'user-agent'?
    // console.log(loginResponse.headers)
    // expect(loginResponse.headers['user-agent']).toEqual('device-1')
    const { accessToken } = loginResponse.body;
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });

    const refreshToken = getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      firstAccessToken: accessToken,
      firstRefreshToken: refreshToken,
    });
  });
  it('3 – POST:/auth/login – return 200 & login 1st user – 2nd device', async () => {
    const { createdUser1, password1 } = expect.getState();

    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-2')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    // expect(loginResponse.headers['user-agent']).toEqual('device-2')
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      secondAccessToken: accessToken,
      secondRefreshToken: refreshToken,
    });
  });
  it('4 – POST:/auth/login – return 200 & login 1st user – 3rd device', async () => {
    const { createdUser1, password1 } = expect.getState();

    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-3')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    // expect(loginResponse.headers['user-agent']).toEqual('device-3')
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      thirdAccessToken: accessToken,
      thirdRefreshToken: refreshToken,
    });
  });
  it('5 – POST:/auth/login – return 200 & login 1st user - 4th device', async () => {
    const { createdUser1, password1 } = expect.getState();

    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-4')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    // expect(loginResponse.headers['user-agent']).toEqual('device-4')
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      fourthAccessToken: accessToken,
      fourthRefreshToken: refreshToken,
    });
  });
  // получаю активные сессии этих девайсов
  it('6 – GET:/security/devices – return all login devices 1st user', async () => {
    const { firstRefreshToken } = expect.getState();
    const getResponse = await request(server)
      .get('/security/devices')
      .set('cookie', firstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body[0].deviceId).toEqual(expect.any(String));

    expect.setState({
      firstDeviceIdFirstUser: getResponse.body[0].deviceId,
      firstLastActiveDateFirstUser: getResponse.body[0].lastActiveDate,
      secondDeviceIdFirstUser: getResponse.body[1].deviceId,
    });
  });
  // пробую удалить несуществующий девайс
  it('7 – DELETE:/security/devices/:id – return 404 if try to delete non-existent device', async () => {
    const { firstRefreshToken } = expect.getState();
    const deleteResponse = await request(server)
      .delete('/security/devices/1')
      .set('cookie', firstRefreshToken);

    expect(deleteResponse).toBeDefined();
    expect(deleteResponse.status).toBe(HttpStatus.NOT_FOUND);
  });
  it('8 – GET-DELETE:/security/devices/(:id) – return 401 with no token', async () => {
    const getNoTokenResponse = await request(server)
      .get('/security/devices')
      .set('cookie', 'noToken');

    expect(getNoTokenResponse).toBeDefined();
    expect(getNoTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);

    const deleteNoTokenResponse = await request(server)
      .delete('/security/devices')
      .set('cookie', 'noToken');

    expect(deleteNoTokenResponse).toBeDefined();
    expect(deleteNoTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);

    const deleteByDeviceIdNoTokenResponse = await request(server)
      .delete('/security/devices/111')
      .set('cookie', 'noToken');

    expect(deleteByDeviceIdNoTokenResponse).toBeDefined();
    expect(deleteByDeviceIdNoTokenResponse.status).toBe(
      HttpStatus.UNAUTHORIZED,
    );
  });
  // пробую удалить активную сессию другого девайса
  it("9 – DELETE:/security/devices/:id – return 403 if try to delete 1st user's devise by 2nd user", async () => {
    // create 2nd user
    const password = 'qwerty2';
    const createResponse = await request(server)
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'lg-222222',
        password: password,
        email: 'valid2-email@mail.ru',
      });

    // login 2nd user
    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-1')
      .send({
        loginOrEmail: createResponse.body.login,
        password: password,
      });
    const firstRefreshTokenSecondUser =
      getRefreshTokenByResponseWithTokenName(loginResponse);

    // try to delete 1st user's devise by 2nd user
    const { firstDeviceIdFirstUser } = expect.getState();
    const deleteResponse = await request(server)
      .delete(`/security/devices/${firstDeviceIdFirstUser}`)
      .set('cookie', firstRefreshTokenSecondUser);

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse).toBeDefined();
    expect(deleteResponse.status).toBe(HttpStatus.FORBIDDEN);
  });
  // получаю новую пру токенов
  it('10 – POST:/auth/refresh-token – return 200, newRefreshToken & newAccessToken', async () => {
    const { firstRefreshToken } = expect.getState();
    const goodRefreshTokenResponse = await request(server)
      .post('/auth/refresh-token')
      .set('cookie', firstRefreshToken);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.OK);
    expect(goodRefreshTokenResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    const newFirstRefreshToken = getRefreshTokenByResponseWithTokenName(
      goodRefreshTokenResponse,
    );
    expect(newFirstRefreshToken).toBeDefined();
    expect(newFirstRefreshToken).toEqual(expect.any(String));
    expect(newFirstRefreshToken).not.toBe(firstRefreshToken);
    expect.setState({ newFirstRefreshToken });
  });
  // ???
  it('11 – GET:/security/devices – return all login devices 1st user – other lastActiveDate 1st device', async () => {
    const { newFirstRefreshToken, firstLastActiveDateFirstUser } =
      expect.getState();
    const getResponse = await request(server)
      .get('/security/devices')
      .set('cookie', newFirstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body[0].deviceId).toEqual(expect.any(String));
    expect(getResponse.body[0].lastActiveDate).not.toEqual(
      firstLastActiveDateFirstUser,
    );

    expect.setState({ firstDeviceIdFirstUser: getResponse.body[0].deviceId });
  });
  it("12 – DELETE:/security/devices/:id – return 204 & delete 1st user's 2nd device", async () => {
    const { newFirstRefreshToken, secondDeviceIdFirstUser } = expect.getState();
    const deleteResponse = await request(server)
      .delete(`/security/devices/${secondDeviceIdFirstUser}`)
      .set('cookie', newFirstRefreshToken);

    expect(deleteResponse).toBeDefined();
    expect(deleteResponse.status).toBe(HttpStatus.NO_CONTENT);
  });
  it('13 – GET:/security/devices – return all login devices 1st user – without 2nd device', async () => {
    const { newFirstRefreshToken } = expect.getState();
    const getResponse = await request(server)
      .get('/security/devices')
      .set('cookie', newFirstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.length).toEqual(3);
  });

  it('14 – POST:/auth/logout – return 204 & logout 3rd device', async () => {
    const { thirdRefreshToken } = expect.getState();
    const logoutResponse = await request(server)
      .post('/auth/logout')
      .set('cookie', thirdRefreshToken);

    expect(logoutResponse).toBeDefined();
    expect(logoutResponse.status).toBe(HttpStatus.NO_CONTENT);
  });
  it('15 – GET:/security/devices – return all login devices 1st user – without 3rd device', async () => {
    const { newFirstRefreshToken } = expect.getState();
    const getResponse = await request(server)
      .get('/security/devices')
      .set('cookie', newFirstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.length).toEqual(2);
  });

  it("16 – DELETE:/security/devices – return 204 & terminate all other (exclude current) device's sessions", async () => {
    const { firstRefreshToken } = expect.getState();
    const getResponse = await request(server)
      .delete('/security/devices')
      .set('cookie', firstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.NO_CONTENT);
  });
  it('17 – GET:/security/devices – return all login devices 1st user – only 1st device', async () => {
    const { newFirstRefreshToken } = expect.getState();
    const getResponse = await request(server)
      .get('/security/devices')
      .set('cookie', newFirstRefreshToken);

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.length).toEqual(1);
  });

  it('18 – POST:/auth/login – return 429', async () => {
    const { createdUser1, password1 } = expect.getState();
    await sleep(10);

    await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-2')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-3')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-4')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-5')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-6')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    const loginResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-7')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.TOO_MANY_REQUESTS);

    expect(loginResponse).toBeDefined();
  });
  it('19 – POST:/auth/registration-email-resending – return 429', async () => {
    const { createdUser1 } = expect.getState();

    await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-2')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-3')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-4')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-5')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-6')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.BAD_REQUEST);

    const loginResponse = await request(server)
      .post('/auth/registration-email-resending')
      .set('user-agent', 'device-7')
      .send({ loginOrEmail: createdUser1.email })
      .expect(HttpStatus.TOO_MANY_REQUESTS);

    expect(loginResponse).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import {
  getRefreshTokenByResponse,
  getRefreshTokenByResponseWithTokenName,
} from '../src/infrastructure/utils/utils';

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  //let repo;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    // repo = app.get()

    server = app.getHttpServer();
    await request(server).delete('/testing/all-data');
  });

  it('1 – GET:/auth/me – return 401', async () => {
    await request(server).get('/auth/me').expect(HttpStatus.UNAUTHORIZED);
  });
  it('2 – POST:/auth/login – return 401', async () => {
    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail: 'valid-unauthorized@mail.ru',
        password: 'qwerty1',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // создаю 1го пользователя как админ
  it('3 – POST:/sa/users – create 1st user by admin', async () => {
    const firstUser = {
      login: 'lg-1111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };
    const firstCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: firstUser.login,
        password: firstUser.password,
        email: firstUser.email,
      })
      .expect(HttpStatus.CREATED);

    const firstCreatedUser = firstCreateResponse.body;
    expect(firstCreatedUser).toEqual({
      id: expect.any(String),
      login: firstUser.login,
      email: firstUser.email,
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });

    await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedUser],
      });

    expect.setState({
      firstUser: firstUser,
      firstCreateResponse: firstCreateResponse,
    });
  });
  it('4 – GET:/auth/me – return created 1st user', async () => {
    const { firstUser, firstCreateResponse } = expect.getState();
    //чтобы .split не ругался на возможный undefined
    if (!firstCreateResponse.headers.authorization) return new Error();
    const accessToken =
      getRefreshTokenByResponseWithTokenName(firstCreateResponse);

    await request(server)
      .get('/auth/me')
      .auth('accessToken', { type: 'bearer' })
      .expect(HttpStatus.OK, {
        email: firstUser.email,
        login: firstUser.login,
        userId: firstUser.userId,
      });

    expect.setState({ firstAccessToken: accessToken });
  });

  // негативные тесты
  it("5 – POST:/auth/registration-email-resending – return 400 if email doesn't exist", async () => {
    await request(server)
      .post('/auth/registration-email-resending')
      .send({ email: 'unknown-email@mail.com' })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'email not exist or confirm',
            field: 'email',
          },
        ],
      });
  });
  it('6 – POST:/auth/registration-email-resending – return 400 if email already confirm', async () => {
    const { firstUser } = expect.getState();
    await request(server)
      .post('/auth/registration-email-resending')
      .send({ email: firstUser.email })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'email not exist or confirm',
            field: 'email',
          },
        ],
      });
  });

  it("7 – POST:/auth/registration – return 400 if user's email already exist", async () => {
    const { firstUser } = expect.getState();
    await request(server)
      .post('/auth/registration')
      .send({
        login: 'otherLogin',
        password: firstUser.password,
        email: firstUser.email,
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'email exist',
            field: 'email',
          },
        ],
      });
  });
  it("8 – POST:/auth/registration – return 400 if user's login already exist", async () => {
    const { firstUser } = expect.getState();
    await request(server)
      .post('/auth/registration')
      .send({
        login: firstUser.login,
        password: firstUser.password,
        email: 'other-email@mail.com',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'login exist',
            field: 'login',
          },
        ],
      });
  });

  // создаю 2го пользователя как пользователь
  it('9 – POST:/auth/registration – return 204, create 2nd user & send confirmation code', async () => {
    const secondUser = {
      login: 'lg-2222',
      password: 'qwerty2',
      email: 'artgolubev@bk.ru',
    };
    await request(server)
      .post('/auth/registration')
      .send({
        login: secondUser.login,
        password: secondUser.password,
        email: secondUser.email,
      })
      .expect(HttpStatus.NO_CONTENT);

    expect.setState({ secondUser: secondUser });
  });
  it('10 – POST:/auth/registration-email-resending – return 204 if user exist & send confirmation code', async () => {
    const { secondUser } = expect.getState();
    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email: secondUser.email,
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it("11 – POST:/auth/registration-confirmation – return 400 if confirmation code doesn't exist", async () => {
    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        code: 'invalid code',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'code is incorrect, expired or already applied',
            field: 'code',
          },
        ],
      });
  });

  it('12 – POST:/auth/refresh-token – return 401 with no token', async () => {
    await request(server)
      .post('/auth/refresh-token')
      .send('noToken')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // логиню первого пользователя
  it('13 – POST:/auth/login – return 200 and login 1st user', async () => {
    const { firstUser } = expect.getState();
    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: firstUser.login,
      password: firstUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({ accessToken, firstRefreshToken: refreshToken });
  });

  // получаю новую пру токенов
  it('14 – POST:/auth/refresh-token – return 200, new pair of tokens', async () => {
    const { accessToken, firstRefreshToken } = expect.getState();
    await sleep(1.1);
    const goodRefreshTokenResponse = await request(server)
      .post('/auth/refresh-token')
      .set('cookie', `refreshToken=${firstRefreshToken}`);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.OK);
    expect(goodRefreshTokenResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    const newAccessToken = goodRefreshTokenResponse.body.accessToken;
    expect(newAccessToken).not.toBe(accessToken);

    const newRefreshToken = getRefreshTokenByResponseWithTokenName(
      goodRefreshTokenResponse,
    );
    expect(newRefreshToken).toBeDefined();
    expect(newRefreshToken).toEqual(expect.any(String));
    expect(newRefreshToken).not.toBe(firstRefreshToken);

    expect.setState({
      secondAccessToken: newAccessToken,
      secondRefreshToken: newRefreshToken,
    });
  });

  it('15 – POST:/auth/refresh-token – return 401 with no token', async () => {
    const goodRefreshTokenResponse = await request(server).post(
      '/auth/refresh-token',
    );

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it('16 – POST:/auth/refresh-token – return 401 with old token', async () => {
    const { firstRefreshToken } = expect.getState();
    await sleep(1.1);

    const goodRefreshTokenResponse = await request(server)
      .post('/auth/refresh-token')
      .set('cookie', firstRefreshToken);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('17 – POST:/auth/password-recovery – return 400 with no email in body', async () => {
    const { secondRefreshToken } = expect.getState();
    const recoveryResponse = await request(server)
      .post('/auth/password-recovery')
      .set('cookie', `refreshToken=${secondRefreshToken}`);

    expect(recoveryResponse).toBeDefined();
    expect(recoveryResponse.status).toBe(HttpStatus.BAD_REQUEST);
  });
  it('18 – POST:/auth/password-recovery – return 204 & send recovery code to email', async () => {
    const { firstUser, secondRefreshToken } = expect.getState();

    const recoveryResponse = await request(server)
      .post('/auth/password-recovery')
      .set('cookie', secondRefreshToken)
      .send({ email: firstUser.email });

    expect(recoveryResponse).toBeDefined();
    //для тестов здесть OK, поставить такой же статус в контроллере
    expect(recoveryResponse.status).toBe(HttpStatus.OK);
    expect.setState({ recoveryCode: recoveryResponse.body.recoveryCode });

    // console.log({ recoveryCode_body: recoveryResponse.body });
  });

  it('19 – POST:/auth/new-password – return 400 with incorrect recoveryCode', async () => {
    const newPasswordResponse = await request(server)
      .post('/auth/new-password')
      .send({
        recoveryCode: 'incorrect',
        newPassword: 'newPassword',
      });

    expect(newPasswordResponse).toBeDefined();
    expect(newPasswordResponse.status).toBe(HttpStatus.BAD_REQUEST);
  });
  it('20 – POST:/auth/new-password – return 204 & update password', async () => {
    const { recoveryCode } = expect.getState();
    //todo - достаю recoveryCode прямо из базы по userId
    // const code = userModel.findOne();

    const newPasswordResponse = await request(server)
      .post('/auth/new-password')
      .send({
        recoveryCode: recoveryCode,
        newPassword: 'newPassword',
      });

    expect(newPasswordResponse).toBeDefined();
    expect(newPasswordResponse.status).toBe(HttpStatus.NO_CONTENT);
  });

  // it('21 – POST:/auth/password-recovery – return 429', async () => {
  //   const { firstUser } = expect.getState();
  //   await sleep(10);
  //
  //   await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-2')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.OK);
  //
  //   await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-3')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.OK);
  //
  //   await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-4')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.OK);
  //
  //   await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-5')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.OK);
  //
  //   await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-6')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.OK);
  //
  //   const loginResponse = await request(server)
  //     .post('/auth/password-recovery')
  //     .set('user-agent', 'device-7')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.TOO_MANY_REQUESTS);
  //
  //   expect(loginResponse).toBeDefined();
  // });
  // it('22 – POST:/auth/new-password – return 429', async () => {
  //   const { firstUser } = expect.getState();
  //
  //   await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-2')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-3')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-4')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-5')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-6')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   const loginResponse = await request(server)
  //     .post('/auth/new-password')
  //     .set('user-agent', 'device-7')
  //     .send({ email: firstUser.email })
  //     .expect(HttpStatus.TOO_MANY_REQUESTS);
  //
  //   expect(loginResponse).toBeDefined();
  // });

  it('23 – POST:/auth/logout – return 204 & logout 1st user', async () => {
    const { secondRefreshToken } = expect.getState();
    const goodRefreshTokenResponse = await request(server)
      .post('/auth/logout')
      .set('cookie', secondRefreshToken);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.NO_CONTENT);
  });
  it('24 – POST:/auth/refresh-token – return 401 with old token', async () => {
    const { secondRefreshToken } = expect.getState();

    const goodRefreshTokenResponse = await request(server)
      .post('/auth/logout')
      .set('cookie', secondRefreshToken);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('25 – POST:/auth/login – return 200 and login 1st user', async () => {
    const { firstUser } = expect.getState();

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: firstUser.login,
      password: 'newPassword',
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({ accessToken, thirdRefreshToken: refreshToken });
  });
  it('26 – POST:/auth/refresh-token – return 401 with old token', async () => {
    const { thirdRefreshToken } = expect.getState();
    await sleep(21.1);

    const goodRefreshTokenResponse = await request(server)
      .post('/auth/refresh-token')
      .set('cookie', thirdRefreshToken);

    expect(goodRefreshTokenResponse).toBeDefined();
    expect(goodRefreshTokenResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  afterAll(async () => {
    await app.close();
  });
});

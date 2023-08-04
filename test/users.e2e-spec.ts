import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';

describe('UsersController (e2e)', () => {
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

  it('1 – GET:/sa/users – return 200 & empty array', async () => {
    await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('2 – POST:/sa/users – return 201 & create 1st user', async () => {
    const firstUser = {
      login: 'lg-111111',
      password: 'qwerty1',
      email: 'valid-email@mail1.ru',
    };
    const createResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: firstUser.login,
        password: firstUser.password,
        email: firstUser.email,
      });

    expect(createResponse).toBeDefined();
    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    const firstCreatedUser = createResponse.body;
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
    expect.setState({ firstCreatedUser: firstCreatedUser });
  });
  it('3 – POST:/sa/users – return 201 & create 2nd user', async () => {
    const { firstCreatedUser } = expect.getState();
    const secondUser = {
      login: 'lg-222222',
      password: 'qwerty2',
      email: 'valid-email@mail2.ru',
    };
    const createResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: secondUser.login,
        password: secondUser.password,
        email: secondUser.email,
      });

    expect(createResponse).toBeDefined();
    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    const secondCreatedUser = createResponse.body;
    expect(secondCreatedUser).toEqual({
      id: expect.any(String),
      login: secondUser.login,
      email: secondUser.email,
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
        totalCount: 2,
        items: [secondCreatedUser, firstCreatedUser],
      });
    expect.setState({ secondCreatedUser: secondCreatedUser });
  });
  it('4 – POST:/sa/users – return 201 & create 3rd user', async () => {
    const { firstCreatedUser, secondCreatedUser } = expect.getState();
    const thirdUser = {
      login: 'lg-333333',
      password: 'qwerty3',
      email: 'valid-email@mail3.ru',
    };
    const createResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: thirdUser.login,
        password: thirdUser.password,
        email: thirdUser.email,
      });

    expect(createResponse).toBeDefined();
    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    const thirdCreatedUser = createResponse.body;
    expect(thirdCreatedUser).toEqual({
      id: expect.any(String),
      login: thirdUser.login,
      email: thirdUser.email,
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
        totalCount: 3,
        items: [thirdCreatedUser, secondCreatedUser, firstCreatedUser],
      });
    expect.setState({ thirdCreatedUser: thirdCreatedUser });
  });
  it('5 – POST:/sa/users – return 201 & create 4th user', async () => {
    const { firstCreatedUser, secondCreatedUser, thirdCreatedUser } =
      expect.getState();
    const fourthUser = {
      login: 'lg-444444',
      password: 'qwerty4',
      email: 'valid-email@mail4.ru',
    };
    const createResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: fourthUser.login,
        password: fourthUser.password,
        email: fourthUser.email,
      });

    expect(createResponse).toBeDefined();
    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    const fourthCreatedUser = createResponse.body;
    expect(fourthCreatedUser).toEqual({
      id: expect.any(String),
      login: fourthUser.login,
      email: fourthUser.email,
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
        totalCount: 4,
        items: [
          fourthCreatedUser,
          thirdCreatedUser,
          secondCreatedUser,
          firstCreatedUser,
        ],
      });

    expect.setState({ fourthCreatedUser: fourthCreatedUser });
  });

  it('6 – DELETE:/sa/users – return 404', async () => {
    await request(server)
      .delete('/sa/users/1')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NOT_FOUND);
  });
  it('7 – DELETE:/sa/users – return 204 & delete 1st user', async () => {
    const {
      fourthCreatedUser,
      thirdCreatedUser,
      secondCreatedUser,
      firstCreatedUser,
    } = expect.getState();

    await request(server)
      .delete(`/sa/users/${firstCreatedUser.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [fourthCreatedUser, thirdCreatedUser, secondCreatedUser],
      });
  });

  it('8 – PUT:/sa/users/:id/ban – return 404', async () => {
    await request(server)
      .put('/sa/users/1111/ban')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'kmkmkmkmkkmkmkmkmkmkm',
      })
      .expect(HttpStatus.NOT_FOUND);
  });
  it('9 – PUT:/sa/users/:id/ban – return 204 & ban 2nd user', async () => {
    const { fourthCreatedUser, thirdCreatedUser, secondCreatedUser } =
      expect.getState();
    const banInputModel = {
      isBanned: true,
      banReason: 'length_21-weqweqweqwq',
    };

    await request(server)
      .put(`/sa/users/${secondCreatedUser.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(banInputModel)
      .expect(HttpStatus.NO_CONTENT);

    const secondBannedUser = {
      id: secondCreatedUser.id,
      login: secondCreatedUser.login,
      email: secondCreatedUser.email,
      createdAt: secondCreatedUser.createdAt,
      banInfo: {
        isBanned: banInputModel.isBanned,
        banDate: expect.any(String),
        banReason: banInputModel.banReason,
      },
    };

    const getUsers = await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    // todo (совет) если у body большая вложенность, использовть такой expect
    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [fourthCreatedUser, thirdCreatedUser, secondBannedUser],
    });

    expect.setState({ secondBannedUser });
  });

  it('10 – GET:/sa/users – return 200 & 2, 3, 4 users', async () => {
    const { fourthCreatedUser, thirdCreatedUser, secondBannedUser } =
      expect.getState();

    const getUsers = await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [fourthCreatedUser, thirdCreatedUser, secondBannedUser],
    });
  });
  it('11 – GET:/sa/users – return 200 & 2 user', async () => {
    const { secondBannedUser } = expect.getState();

    const getUsers = await request(server)
      .get('/sa/users?banStatus=banned')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [secondBannedUser],
    });
  });
  it('12 – GET:/sa/users – return 200 & 3, 4 users', async () => {
    const { fourthCreatedUser, thirdCreatedUser } = expect.getState();

    const getUsers = await request(server)
      .get('/sa/users?banStatus=notBanned')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [fourthCreatedUser, thirdCreatedUser],
    });
  });

  it('11 – PUT:/sa/users/:id/ban – return 204 & unban 2nd user', async () => {
    const { fourthCreatedUser, thirdCreatedUser, secondCreatedUser } =
      expect.getState();
    const unbanInputModel = {
      isBanned: false,
      banReason: 'length_21-weqweqweqwq',
    };

    await request(server)
      .put(`/sa/users/${secondCreatedUser.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(unbanInputModel)
      .expect(HttpStatus.NO_CONTENT);

    const secondBannedUser = {
      id: secondCreatedUser.id,
      login: secondCreatedUser.login,
      email: secondCreatedUser.email,
      createdAt: secondCreatedUser.createdAt,
      banInfo: {
        isBanned: unbanInputModel.isBanned,
        banDate: null,
        banReason: null,
      },
    };

    const getUsers = await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [fourthCreatedUser, thirdCreatedUser, secondBannedUser],
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

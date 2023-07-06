import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  it('1 – GET:/users – return 200 & empty array', async () => {
    await request(app.getHttpServer())
      .get('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('2 – POST:/users – return 201 & create first user', async () => {
    const firstUser = {
      login: 'lg-111111',
      password: 'qwerty1',
      email: 'valid-email@mail1.ru',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/users')
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
    });

    await request(app.getHttpServer())
      .get('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedUser],
      });
    expect.setState({ firstCreatedUser: firstCreatedUser });
  });
  it('3 – POST:/users – return 201 & create second user', async () => {
    const { firstCreatedUser } = expect.getState();
    const secondUser = {
      login: 'lg-222222',
      password: 'qwerty2',
      email: 'valid-email@mail2.ru',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/users')
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
    });

    await request(app.getHttpServer())
      .get('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [firstCreatedUser, secondCreatedUser],
      });
    expect.setState({ secondCreatedUser: secondCreatedUser });
  });
  it('4 – POST:/users – return 201 & create third user', async () => {
    const { firstCreatedUser, secondCreatedUser } = expect.getState();
    const thirdUser = {
      login: 'lg-333333',
      password: 'qwerty3',
      email: 'valid-email@mail3.ru',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/users')
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
    });

    await request(app.getHttpServer())
      .get('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [firstCreatedUser, secondCreatedUser, thirdCreatedUser],
      });
    expect.setState({ thirdCreatedUser: thirdCreatedUser });
  });
  it('5 – POST:/users – return 201 & create fourth user', async () => {
    const { firstCreatedUser, secondCreatedUser, thirdCreatedUser } =
      expect.getState();
    const fourthUser = {
      login: 'lg-444444',
      password: 'qwerty4',
      email: 'valid-email@mail4.ru',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/users')
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
    });

    await request(app.getHttpServer())
      .get('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          firstCreatedUser,
          secondCreatedUser,
          thirdCreatedUser,
          fourthCreatedUser,
        ],
      });
    expect.setState({ fourthCreatedUser: fourthCreatedUser });
  });

  it('6 – DELETE:/users – return 404', async () => {
    request(app.getHttpServer())
      .delete('/users/1')
      .expect(HttpStatus.NOT_FOUND);
  });
  it('7 – DELETE:/users – return 204 & delete first user', async () => {
    const { firstCreatedUser } = expect.getState();
    request(app.getHttpServer())
      .delete(`/users/${firstCreatedUser.id}`)
      .expect(HttpStatus.NO_CONTENT);
  });
});

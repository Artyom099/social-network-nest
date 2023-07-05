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
      login: 'lg-647449',
      password: 'qwerty1',
      email: 'valid-email@mail.ru',
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

  it('3 – DELETE:/users – return 204 & delete first user', async () => {
    const { firstCreatedUser } = expect.getState();
    request(app.getHttpServer())
      .delete(`/users/${firstCreatedUser.id}`)
      .expect(HttpStatus.NO_CONTENT);
  });
});

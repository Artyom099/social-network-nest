import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('1 - should return 200 and empty array', async () => {
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

  let createdUser1: any = null;
  const password1 = 'qwerty1';
  it('2 - should create user with correct input data', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        login: 'lg-647449',
        password: password1,
        email: 'valid-email@mail.ru',
      })
      .expect(HttpStatus.CREATED);

    createdUser1 = createResponse.body;
    expect(createdUser1).toEqual({
      id: expect.any(String),
      login: createdUser1.login,
      email: createdUser1.email,
      createdAt: expect.any(String),
    });

    await request(app.getHttpServer())
      .get('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUser1],
      });
  });

  it('3 - should login to system with correct input data', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createdUser1.login,
        password: password1,
      })
      .expect(HttpStatus.OK);

    //чтобы .split не ругался на возможный undefined
    if (!createResponse.headers.authorization) return new Error();
    // token = createResponse.headers.authorization.split(' ')[1];
    await request(app.getHttpServer()).get('/auth/me').expect(HttpStatus.OK, {
      email: createdUser1.email,
      login: createdUser1.login,
      userId: createdUser1.userId,
    });
  });
});

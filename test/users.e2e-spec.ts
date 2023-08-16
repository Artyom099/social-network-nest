import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import {
  getRefreshTokenByResponse,
  getRefreshTokenByResponseWithTokenName,
} from '../src/infrastructure/utils/utils';
import { LikeStatus } from '../src/infrastructure/utils/constants';

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

  it('10 – GET:/sa/users – return 200 & 2, 3, 4 users (all)', async () => {
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
  it('11 – GET:/sa/users – return 200 & 2 user (banned)', async () => {
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
  it('12 – GET:/sa/users – return 200 & 3, 4 users (not banned)', async () => {
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

  it('13 – PUT:/sa/users/:id/ban – return 204 & unban 2nd user', async () => {
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
      .get('/sa/users?banStatus=notBanned')
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

  // it('1 – POST:/sa/users – return 201 & create 1st user', async () => {
  //   const firstUser = {
  //     login: 'loSer',
  //     password: 'qwerty1',
  //     email: 'email2p@gg.om',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: firstUser.login,
  //       password: firstUser.password,
  //       email: firstUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const firstCreatedUser = createResponse.body;
  //   expect(firstCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: firstUser.login,
  //     email: firstUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User1: firstCreatedUser });
  // });
  // it('2 – POST:/sa/users – return 201 & create 2nd user', async () => {
  //   const secondUser = {
  //     login: 'log01',
  //     password: 'qwerty2',
  //     email: 'emai@gg.com',
  //   };
  //
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: secondUser.login,
  //       password: secondUser.password,
  //       email: secondUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const secondCreatedUser = createResponse.body;
  //   expect(secondCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: secondUser.login,
  //     email: secondUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User2: secondCreatedUser });
  // });
  // it('3 – POST:/sa/users – return 201 & create 3rd user', async () => {
  //   const thirdUser = {
  //     login: 'log02',
  //     password: 'qwerty3',
  //     email: 'email2p@g.com',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: thirdUser.login,
  //       password: thirdUser.password,
  //       email: thirdUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const thirdCreatedUser = createResponse.body;
  //   expect(thirdCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: thirdUser.login,
  //     email: thirdUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User3: thirdCreatedUser });
  // });
  // it('4 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'uer15',
  //     password: 'qwerty4',
  //     email: 'emarrr1@gg.com',
  //   };
  //
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User4: fourthCreatedUser });
  // });
  // it('5 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'user01',
  //     password: 'qwerty4',
  //     email: 'email1p@gg.cm',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User5: fourthCreatedUser });
  // });
  // it('6 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'user02',
  //     password: 'qwerty4',
  //     email: 'email1p@gg.com',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User6: fourthCreatedUser });
  // });
  // it('7 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'user03',
  //     password: 'qwerty4',
  //     email: 'email1p@gg.cou',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User7: fourthCreatedUser });
  // });
  // it('8 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'user05',
  //     password: 'qwerty4',
  //     email: 'email1p@gg.coi',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User8: fourthCreatedUser });
  // });
  // it('9 – POST:/sa/users – return 201 & create 4th user', async () => {
  //   const fourthUser = {
  //     login: 'usr-1-01',
  //     password: 'qwerty4',
  //     email: 'email3@gg.com',
  //   };
  //   const createResponse = await request(server)
  //     .post('/sa/users')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       login: fourthUser.login,
  //       password: fourthUser.password,
  //       email: fourthUser.email,
  //     });
  //
  //   expect(createResponse).toBeDefined();
  //   expect(createResponse.status).toEqual(HttpStatus.CREATED);
  //   const fourthCreatedUser = createResponse.body;
  //   expect(fourthCreatedUser).toEqual({
  //     id: expect.any(String),
  //     login: fourthUser.login,
  //     email: fourthUser.email,
  //     createdAt: expect.any(String),
  //     banInfo: {
  //       isBanned: false,
  //       banDate: null,
  //       banReason: null,
  //     },
  //   });
  //
  //   expect.setState({ User9: fourthCreatedUser });
  // });
  // it('10 – GET:/sa/users – return 200 & 9 users', async () => {
  //   const { User1, User2, User3, User4, User5, User6, User7, User8, User9 } =
  //     expect.getState();
  //
  //   const getUsers = await request(server)
  //     .get(
  //       '/sa/users?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=com&sortDirection=asc&sortBy=login',
  //     )
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .expect(HttpStatus.OK);
  //
  //   expect(getUsers.body).toEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 15,
  //     totalCount: 9,
  //     items: [User1, User2, User3, User4, User5, User6, User7, User8, User9],
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});

describe('Ban users for different blogs', () => {
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

  it('1 – POST:/sa/users – return 201 & create 1st user', async () => {
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

    expect.setState({ firstUser, firstCreatedUser });
  });
  it('2 – POST:/sa/users – return 201 & create 2nd user', async () => {
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

    expect.setState({ secondUser, secondCreatedUser });
  });
  it('3 – POST:/sa/users – return 201 & create 3rd user', async () => {
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

    expect.setState({ thirdUser, thirdCreatedUser });
  });
  it('4 – POST:/sa/users – return 201 & create 4th user', async () => {
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

    expect.setState({ fourthUser, fourthCreatedUser });
  });

  // 1 юзер логинится, создает блог и пост
  it('5 – POST:/auth/login – return 200, 1st login and refreshToken', async () => {
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
    const refreshTokenWithName =
      getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      firstAccessToken: accessToken,
      firstRefreshToken: refreshToken,
      firstRefreshTokenWithName: refreshTokenWithName,
    });
  });
  it('6 – POST:/blogger/blogs – return 201 & create blog', async () => {
    const { firstAccessToken } = expect.getState();

    const createBlogResponse = await request(server)
      .post('/blogger/blogs')
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        name: 'valid-blog',
        description: 'valid-description',
        websiteUrl: 'valid-websiteUrl.com',
      });

    expect(createBlogResponse).toBeDefined();
    expect(createBlogResponse.status).toEqual(HttpStatus.CREATED);
    expect.setState({
      blogId: createBlogResponse.body.id,
      createdBLog: createBlogResponse.body,
    });
  });
  it('7 – POST:/blogger/blogs/:id/posts – return 201 & create post', async () => {
    const { firstAccessToken, blogId } = expect.getState();

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${blogId}/posts`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      });

    expect(createPostResponse).toBeDefined();
    expect(createPostResponse.status).toEqual(HttpStatus.CREATED);
    expect.setState({
      postId: createPostResponse.body.id,
      createdPost: createPostResponse.body,
    });
  });

  // 1 юзер банит 2го для своего блога
  it('8 – PUT:/blogger/users/:id/ban – return 204 & ban 2nd user for blog', async () => {
    const { secondCreatedUser, firstAccessToken, blogId } = expect.getState();

    const banUserResponse = await request(server)
      .put(`/blogger/users/${secondCreatedUser.id}/ban`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'length_21-weqweqweqwq',
        blogId,
      });

    expect(banUserResponse).toBeDefined();
    expect(banUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('9 – GET:/blogger/users/blog/:id – return 200 & banned 2nd user for blog', async () => {
    const { secondCreatedUser, firstAccessToken, blogId } = expect.getState();

    const getBannedUsersResponse = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getBannedUsersResponse).toBeDefined();
    expect(getBannedUsersResponse.status).toEqual(HttpStatus.OK);
    expect(getBannedUsersResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: secondCreatedUser.id,
          login: secondCreatedUser.login,
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
            banReason: expect.any(String),
          },
        },
      ],
    });
  });

  // 2й юзер создает свой блог и не может написать коммент под постом
  it('10 – POST:/auth/login – return 200, 2nd user login', async () => {
    const { secondUser } = expect.getState();

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: secondUser.login,
      password: secondUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    const refreshTokenWithName =
      getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      secondAccessToken: accessToken,
      secondRefreshToken: refreshToken,
      secondRefreshTokenWithName: refreshTokenWithName,
    });
  });
  it("11 – POST:/posts/:id/comments – return 403 & 2nd user can't comment post", async () => {
    const { secondAccessToken, postId } = expect.getState();

    const createCommentCurrentPost = await request(server)
      .post(`/posts/${postId}/comments`)
      .auth(secondAccessToken, { type: 'bearer' })
      .send({ content: 'valid-comment------21' });

    expect(createCommentCurrentPost).toBeDefined();
    expect(createCommentCurrentPost.status).toEqual(HttpStatus.FORBIDDEN);
  });
  it('12 – POST:/blogger/blogs – return 201 & create blog', async () => {
    const { secondAccessToken } = expect.getState();

    const createBlogResponse = await request(server)
      .post('/blogger/blogs')
      .auth(secondAccessToken, { type: 'bearer' })
      .send({
        name: 'valid-blog-2',
        description: 'valid-description-2',
        websiteUrl: '2-valid-websiteUrl.com',
      });

    expect(createBlogResponse).toBeDefined();
    expect(createBlogResponse.status).toEqual(HttpStatus.CREATED);
    expect.setState({ secondBLog: createBlogResponse.body });
  });

  // 3й юзер пишет коммент под постом
  it('13 – POST:/auth/login – return 200, 3rd user login', async () => {
    const { thirdUser } = expect.getState();

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: thirdUser.login,
      password: thirdUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    const refreshTokenWithName =
      getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      thirdAccessToken: accessToken,
      thirdRefreshToken: refreshToken,
      thirdRefreshTokenWithName: refreshTokenWithName,
    });
  });
  it('14 – POST:/posts/:id/comments – return 201 & ', async () => {
    const { thirdRefreshToken, postId } = expect.getState();

    const createCommentCurrentPost = await request(server)
      .post(`/posts/${postId}/comments`)
      .auth(thirdRefreshToken, { type: 'bearer' })
      .send({ content: 'valid-comment------21' });

    expect(createCommentCurrentPost).toBeDefined();
    expect(createCommentCurrentPost.status).toEqual(HttpStatus.CREATED);
  });

  // 1й юзер смотрит все комменты своего блога
  it('15 – GET:/blogger/blogs/comments – return 201', async () => {
    const { firstRefreshToken, thirdCreatedUser, createdPost, createdBLog } =
      expect.getState();

    const getCommentsCurrentBlog = await request(server)
      .get(`/blogger/blogs/comments`)
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getCommentsCurrentBlog).toBeDefined();
    expect(getCommentsCurrentBlog.status).toEqual(HttpStatus.OK);
    expect(getCommentsCurrentBlog.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          content: expect.any(String),
          createdAt: expect.any(String),
          commentatorInfo: {
            userId: thirdCreatedUser.id,
            userLogin: thirdCreatedUser.login,
          },
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
          },
          postInfo: {
            id: createdPost.id,
            title: createdPost.title,
            blogId: createdBLog.id,
            blogName: createdBLog.name,
          },
        },
      ],
    });
  });

  // 1й юзер смотрит забаненых юзеров своего блога
  it('16– GET:/blogger/users/blog/:id – return 201', async () => {
    const { firstRefreshToken, blogId, secondCreatedUser } = expect.getState();

    const getCommentsCurrentBlog = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getCommentsCurrentBlog).toBeDefined();
    expect(getCommentsCurrentBlog.status).toEqual(HttpStatus.OK);
    expect(getCommentsCurrentBlog.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: secondCreatedUser.id,
          login: secondCreatedUser.login,
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
            banReason: expect.any(String),
          },
        },
      ],
    });
  });

  // 1й юзер разбанивает 2го для своего блога
  it('17 – PUT:/blogger/users/:id/ban – return 204 & ban 2nd user for blog', async () => {
    const { secondCreatedUser, firstAccessToken, blogId } = expect.getState();

    const banUserResponse = await request(server)
      .put(`/blogger/users/${secondCreatedUser.id}/ban`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        isBanned: false,
        banReason: 'length_21-weqweqweqwq',
        blogId,
      });

    expect(banUserResponse).toBeDefined();
    expect(banUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  // 1й юзер смотрит забаненых юзеров своего блога
  it('18 – GET:/blogger/users/blog/:id – return 201', async () => {
    const { firstRefreshToken, blogId } = expect.getState();

    const getCommentsCurrentBlog = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getCommentsCurrentBlog).toBeDefined();
    expect(getCommentsCurrentBlog.status).toEqual(HttpStatus.OK);
    expect(getCommentsCurrentBlog.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  // админ банит 2й блог
  it('19 – PUT:/blogger/users/:id/ban – return 204', async () => {
    const { secondBLog } = expect.getState();

    const banUserResponse = await request(server)
      .put(`/sa/blogs/${secondBLog.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ isBanned: true });

    expect(banUserResponse).toBeDefined();
    expect(banUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });

  // незареганый юзер видит 1й блог и не видит 2й
  it('20 – GET:/blogs – return 201', async () => {
    const { blogId } = expect.getState();

    const getCommentsCurrentBlog = await request(server).get(`/blogs`);

    expect(getCommentsCurrentBlog).toBeDefined();
    expect(getCommentsCurrentBlog.status).toEqual(HttpStatus.OK);
    expect(getCommentsCurrentBlog.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: blogId,
          name: expect.any(String),
          description: expect.any(String),
          websiteUrl: expect.any(String),
          createdAt: expect.any(String),
          isMembership: false,
        },
        // {
        //   id: firstCreatedBlog.id,
        //   name: firstCreatedBlog.name,
        //   description: firstCreatedBlog.description,
        //   websiteUrl: firstCreatedBlog.websiteUrl,
        //   createdAt: firstCreatedBlog.createdAt,
        //   isMembership: firstCreatedBlog.isMembership,
        // },
      ],
    });
  });
});

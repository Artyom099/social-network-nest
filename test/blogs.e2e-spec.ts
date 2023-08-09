import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LikeStatus } from '../src/infrastructure/utils/constants';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import { getRefreshTokenByResponse } from '../src/infrastructure/utils/utils';

describe('BlogsController (e2e)', () => {
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

  it('0 – POST:/sa/users – create 1st user by admin', async () => {
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
  it('0 – POST:/auth/login – return 200 & login 1st user', async () => {
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

  it('1 – GET:/blogger/blogs – return 200 and empty array', async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
  //негативные тесты
  it('2 – GET:/blogger/blogs/:id – return 404 for not existing blog', async () => {
    await request(server).get('/blogger/blogs/1').expect(HttpStatus.NOT_FOUND);
  });
  it("3 – GET:/blogger/blogs/:id/posts – return 404 & can't get posts of not existing blog", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .get('/blogger/blogs/11/posts')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });
  it("4 – POST:/blogger/blogs/:id/posts – return 404 & can't create posts of not existing blog", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .post(`/blogger/blogs/11/posts`)
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it("5 – POST:/blogger/blogs – return 401 – shouldn't create blog – NO Auth", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .post('/blogger/blogs')
      .send({
        name: 'valid name',
        description: 'valid description',
        websiteUrl: 'https://valid-Url.com',
      })
      .expect(HttpStatus.UNAUTHORIZED);

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it("6 – POST:/blogger/blogs – shouldn't create blog – name = null", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .post('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: null,
        description: 'valid description',
        websiteUrl: 'https://valid-Url.com',
      })
      .expect(
        HttpStatus.BAD_REQUEST,
        // { errorsMessages: [{ message: 'Invalid value', field: 'name' }],}
      );

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
  it("7 – POST:/blogger/blogs – shouldn't create blog – short description", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .post('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: 'valid name',
        description: '<3',
        websiteUrl: 'https://valid-Url.com',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'description must be longer than or equal to 3 characters',
            field: 'description',
          },
        ],
      });

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
  it("8 – POST:/blogger/blogs – shouldn't create blog – invalid websiteUrl", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .post('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: 'valid name',
        description: 'valid description',
        websiteUrl: 'Invalid-Url.c',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          { message: 'websiteUrl must be an URL address', field: 'websiteUrl' },
        ],
      });

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('9 – POST:/blogger/blogs – return 201 & create first blog', async () => {
    const { firstRefreshToken } = expect.getState();
    const firstBlog = {
      name: 'valid-blog',
      description: 'valid-description',
      websiteUrl: 'valid-websiteUrl.com',
    };

    const createResponse = await request(server)
      .post('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: firstBlog.name,
        description: firstBlog.description,
        websiteUrl: firstBlog.websiteUrl,
      })
      .expect(HttpStatus.CREATED);

    const firstCreatedBlog = createResponse.body;
    expect(firstCreatedBlog).toEqual({
      id: expect.any(String),
      name: firstBlog.name,
      description: firstBlog.description,
      websiteUrl: firstBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedBlog],
      });

    expect.setState({ firstCreatedBlog: firstCreatedBlog });
  });
  it('10 – POST:/blogger/blogs – return 201 & create second blog', async () => {
    const { firstRefreshToken } = expect.getState();

    const { firstCreatedBlog } = expect.getState();
    const secondBlog = {
      name: 'second-blog',
      description: '2-valid-description',
      websiteUrl: '2-valid-websiteUrl.com',
    };
    const createResponse = await request(server)
      .post('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: secondBlog.name,
        description: secondBlog.description,
        websiteUrl: secondBlog.websiteUrl,
      })
      .expect(HttpStatus.CREATED);

    const secondCreatedBlog = createResponse.body;
    expect(secondCreatedBlog).toEqual({
      id: expect.any(String),
      name: secondBlog.name,
      description: secondBlog.description,
      websiteUrl: secondBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondCreatedBlog, firstCreatedBlog],
      });

    expect.setState({ secondCreatedBlog: secondCreatedBlog });
  });

  it("11 – PUT:/blogger/blogs/:id – return 404 shouldn't update blog that not exist", async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .put('/blogger/blogs/' + -3)
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: 'val_name update',
        description: 'valid description update',
        websiteUrl: 'https://valid-Url-update.com',
      })
      .expect(HttpStatus.NOT_FOUND);
  });
  it("12 – PUT:/blogger/blogs/:id – return 400 shouldn't update blog with long name", async () => {
    const { firstRefreshToken, firstCreatedBlog, secondCreatedBlog } =
      expect.getState();

    await request(server)
      .put('/blogger/blogs/' + firstCreatedBlog.id)
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: 'invalid long name update',
        description: 'valid description update',
        websiteUrl: 'https://valid-Url-update.com',
      })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .get('/blogger/blogs/')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondCreatedBlog, firstCreatedBlog],
      });
  });

  it('13 – PUT:/blogger/blogs/:id – return 204 & update blog', async () => {
    const { firstRefreshToken, firstCreatedBlog, secondCreatedBlog } =
      expect.getState();
    const firstUpdateBlog = {
      name: 'val_name update',
      description: 'valid description update',
      websiteUrl: 'https://valid-Url-update.com',
    };

    await request(server)
      .put('/blogger/blogs/' + firstCreatedBlog.id)
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        name: firstUpdateBlog.name,
        description: firstUpdateBlog.description,
        websiteUrl: firstUpdateBlog.websiteUrl,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get('/blogger/blogs/')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          secondCreatedBlog,
          {
            ...firstCreatedBlog,
            name: firstUpdateBlog.name,
            description: firstUpdateBlog.description,
            websiteUrl: firstUpdateBlog.websiteUrl,
          },
        ],
      });

    expect.setState({ firstUpdateBlog: firstUpdateBlog });
  });

  it('14 – DELETE:/blogger/blogs/:id – return 404 for delete non-exist blog', async () => {
    const { firstRefreshToken } = expect.getState();

    await request(server)
      .delete('/blogger/blogs/1')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('15 – POST:/blogger/blogs/:id/posts – return 201 & create posts current blog', async () => {
    const { firstRefreshToken, firstCreatedBlog, firstUpdateBlog } =
      expect.getState();
    const firstPost = {
      title: 'valid-title',
      shortDescription: 'valid-shortDescription',
      content: 'valid-content',
    };

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${firstCreatedBlog.id}/posts`)
      .auth(firstRefreshToken, { type: 'bearer' })
      .send({
        title: firstPost.title,
        shortDescription: firstPost.shortDescription,
        content: firstPost.content,
      });

    expect(createPostResponse).toBeDefined();
    expect(createPostResponse.status).toBe(HttpStatus.CREATED);
    expect(createPostResponse.body).toEqual({
      id: expect.any(String),
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstCreatedBlog.id,
      blogName: firstUpdateBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    });

    expect.setState({ createdPost: createPostResponse.body });
  });
  it('16 – GET:/blogger/blogs/:id/posts – return 200 & get posts current blog', async () => {
    const { firstRefreshToken, firstCreatedBlog, createdPost } =
      expect.getState();

    const getPostsRequest = await request(server)
      .get(`/blogger/blogs/${firstCreatedBlog.id}/posts`)
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getPostsRequest).toBeDefined();
    expect(getPostsRequest.status).toBe(HttpStatus.OK);
    expect(getPostsRequest.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [createdPost],
    });
  });

  it('17 – GET:/blogs/:id – return 200 & get posts current blog', async () => {
    const { firstRefreshToken, firstCreatedBlog, firstUpdateBlog } =
      expect.getState();

    const getPostsRequest = await request(server)
      .get(`/blogs/${firstCreatedBlog.id}`)
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getPostsRequest).toBeDefined();
    expect(getPostsRequest.status).toBe(HttpStatus.OK);
    expect(getPostsRequest.body).toEqual({
      id: firstCreatedBlog.id,
      name: firstUpdateBlog.name,
      description: firstUpdateBlog.description,
      websiteUrl: firstUpdateBlog.websiteUrl,
      createdAt: firstCreatedBlog.createdAt,
      isMembership: firstCreatedBlog.isMembership,
    });
  });

  it('18 – DELETE:/blogger/blogs/:id – delete both blogs', async () => {
    const { firstRefreshToken, firstCreatedBlog, secondCreatedBlog } =
      expect.getState();
    await request(server)
      .delete('/blogger/blogs/' + firstCreatedBlog.id)
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/blogger/blogs/' + firstCreatedBlog.id)
      .expect(HttpStatus.NOT_FOUND);

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondCreatedBlog],
      });

    await request(server)
      .delete('/blogger/blogs/' + secondCreatedBlog.id)
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get('/blogger/blogs/' + secondCreatedBlog.id)
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);

    await request(server)
      .get('/blogger/blogs')
      .auth(firstRefreshToken, { type: 'bearer' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

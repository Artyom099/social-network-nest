import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LikeStatus } from '../src/utils/constants';
import { appSettings } from '../src/app.settings';

describe('/blogs', () => {
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

  it('1 – GET:/blogs – return 200 and empty array', async () => {
    await request(server).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('2 – GET:/blogs/:id – return 404 for not existing blog', async () => {
    await request(server).get('/blogs/1').expect(HttpStatus.NOT_FOUND);
  });
  it("3 – GET:/blogs/:id/posts – return 404 & can't get posts of not existing blog", async () => {
    await request(server).get('/blogs/11/posts').expect(HttpStatus.NOT_FOUND);
  });
  it("4 – POST:/blogs/:id/posts – return 404 & can't create posts of not existing blog", async () => {
    await request(server)
      .post(`/blogs/11/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it("5 – POST:/blogs – return 401 – shouldn't create blog – NO Auth", async () => {
    await request(server)
      .post('/blogs')
      .send({
        name: 'valid name',
        description: 'valid description',
        websiteUrl: 'https://valid-Url.com',
      })
      .expect(HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it("6 – POST:/blogs – shouldn't create blog with name = null", async () => {
    await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: null,
        description: 'valid description',
        websiteUrl: 'https://valid-Url.com',
      })
      .expect(
        HttpStatus.BAD_REQUEST,
        // { errorsMessages: [{ message: 'Invalid value', field: 'name' }],}
      );
    await request(server).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it("7 – POST:/blogs – shouldn't create blog with short description", async () => {
    await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
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
    await request(server).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
  it("8 - shouldn't create blog with incorrect input data - (Invalid websiteUrl)", async () => {
    await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
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
    await request(server).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('9 – POST:/blogs – return 201 & create first blog', async () => {
    const firstBlog = {
      name: 'valid-blog',
      description: 'valid-description',
      websiteUrl: 'valid-websiteUrl.com',
    };
    const createResponse = await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
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
      .get('/blogs')
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedBlog],
      });

    expect.setState({ firstCreatedBlog: firstCreatedBlog });
  });
  it('10 – POST:/blogs – return 201 & create second blog', async () => {
    const { firstCreatedBlog } = expect.getState();
    const secondBlog = {
      name: 'second-blog',
      description: '2-valid-description',
      websiteUrl: '2-valid-websiteUrl.com',
    };
    const createResponse = await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
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
      .get('/blogs')
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondCreatedBlog, firstCreatedBlog],
      });

    expect.setState({ secondCreatedBlog: secondCreatedBlog });
  });

  it("11 – PUT:/blogs/:id – shouldn't update blog that not exist", async () => {
    await request(server)
      .put('/blogs/' + -3)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: 'val_name update',
        description: 'valid description update',
        websiteUrl: 'https://valid-Url-update.com',
      })
      .expect(HttpStatus.NOT_FOUND);
  });
  it("12 – PUT:/blogs/:id – shouldn't update blog with long name", async () => {
    const { firstCreatedBlog } = expect.getState();
    await request(server)
      .put('/blogs/' + firstCreatedBlog.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: 'invalid long name update',
        description: 'valid description update',
        websiteUrl: 'https://valid-Url-update.com',
      })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .get('/blogs/' + firstCreatedBlog.id)
      .expect(HttpStatus.OK, firstCreatedBlog);
  });

  it('13 – PUT:/blogs/:id – return 202 & update blog', async () => {
    const { firstCreatedBlog } = expect.getState();
    const firstUpdateBlog = {
      name: 'val_name update',
      description: 'valid description update',
      websiteUrl: 'https://valid-Url-update.com',
    };
    await request(server)
      .put('/blogs/' + firstCreatedBlog.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: firstUpdateBlog.name,
        description: firstUpdateBlog.description,
        websiteUrl: firstUpdateBlog.websiteUrl,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get('/blogs/' + firstCreatedBlog.id)
      .expect(HttpStatus.OK, {
        ...firstCreatedBlog,
        name: firstUpdateBlog.name,
        description: firstUpdateBlog.description,
        websiteUrl: firstUpdateBlog.websiteUrl,
      });

    expect.setState({ firstUpdateBlog: firstUpdateBlog });
  });

  it('14 – DELETE:/blogs/:id – return 404 for delete non-exist blog', async () => {
    await request(server)
      .delete('/blogs/1')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('15 – POST:/blogs/:id/posts – return 201 & create posts current blog', async () => {
    const { firstCreatedBlog, firstUpdateBlog } = expect.getState();
    const firstPost = {
      title: 'valid-title',
      shortDescription: 'valid-shortDescription',
      content: 'valid-content',
    };
    const createPostResponse = await request(server)
      .post(`/blogs/${firstCreatedBlog.id}/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
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
  it('16 – GET:/blogs/:id/posts – return 200 & get posts current blog with pagination', async () => {
    const { firstCreatedBlog, createdPost } = expect.getState();
    const getPostsRequest = await request(server).get(
      `/blogs/${firstCreatedBlog.id}/posts`,
    );

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

  it('17 – DELETE:/blogs/:id – delete both blogs', async () => {
    const { firstCreatedBlog, secondCreatedBlog } = expect.getState();
    await request(server)
      .delete('/blogs/' + firstCreatedBlog.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/blogs/' + firstCreatedBlog.id)
      .expect(HttpStatus.NOT_FOUND);

    await request(server)
      .get('/blogs')
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondCreatedBlog],
      });

    await request(server)
      .delete('/blogs/' + secondCreatedBlog.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get('/blogs/' + secondCreatedBlog.id)
      .expect(HttpStatus.NOT_FOUND);

    await request(server).get('/blogs').expect(HttpStatus.OK, {
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

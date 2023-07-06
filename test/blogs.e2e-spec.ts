import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Stmts - 100%
describe('/blogs', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  it('1 – GET:/blogs – return 200 and empty array', async () => {
    await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('2 - return 404 for not existing blog', async () => {
    await request(app.getHttpServer())
      .get('/blogs/1')
      .expect(HttpStatus.NOT_FOUND);
  });
  it("3 - return 404 - can't get posts of not existing blog", async () => {
    await request(app.getHttpServer())
      .get('/blogs/1/posts')
      .expect(HttpStatus.NOT_FOUND);
  });
  it("4 - return 404 - can't create posts of not existing blog", async () => {
    await request(app.getHttpServer())
      .post(`/blogs/1/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  // it("5 - shouldn't create blog with correct input - NO Auth", async () => {
  //   await request(app.getHttpServer())
  //     .post('/blogs')
  //     .send({
  //       name: 'valid name',
  //       description: 'valid description',
  //       websiteUrl: 'https://valid-Url.com',
  //     })
  //     .expect(HttpStatus.UNAUTHORIZED);
  //
  //   await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
  //     pagesCount: 0,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 0,
  //     items: [],
  //   });
  // });

  // it("6 - shouldn't create blog with incorrect input data (name = null)", async () => {
  //   await request(app.getHttpServer())
  //     .post('/blogs')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       name: null,
  //       description: 'valid description',
  //       websiteUrl: 'https://valid-Url.com',
  //     })
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [{ message: 'Invalid value', field: 'name' }],
  //     });
  //   await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
  //     pagesCount: 0,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 0,
  //     items: [],
  //   });
  // });
  // it("7 - shouldn't create blog with incorrect input data - (short description)", async () => {
  //   await request(app.getHttpServer())
  //     .post('/blogs')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       name: 'valid name',
  //       description: '<3',
  //       websiteUrl: 'https://valid-Url.com',
  //     })
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [{ message: 'Invalid value', field: 'description' }],
  //     });
  //   await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
  //     pagesCount: 0,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 0,
  //     items: [],
  //   });
  // });
  // it("8 - shouldn't create blog with incorrect input data - (Invalid websiteUrl)", async () => {
  //   await request(app.getHttpServer())
  //     .post('/blogs')
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       name: 'valid name',
  //       description: 'valid description',
  //       websiteUrl: 'Invalid-Url.c',
  //     })
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [{ message: 'Invalid value', field: 'websiteUrl' }],
  //     });
  //   await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
  //     pagesCount: 0,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 0,
  //     items: [],
  //   });
  // });

  it('9 – POST:/blogs – return 201 & create first blog', async () => {
    const firstBlog = {
      name: 'valid-blog',
      description: 'valid-description',
      websiteUrl: 'valid-websiteUrl.com',
    };
    const createResponse = await request(app.getHttpServer())
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

    await request(app.getHttpServer())
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
      name: 'second-valid-blog',
      description: '2-valid-description',
      websiteUrl: '2-valid-websiteUrl.com',
    };
    const createResponse = await request(app.getHttpServer())
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

    await request(app.getHttpServer())
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

  // it("11 - shouldn't update blog that not exist", async () => {
  //   await request(app.getHttpServer())
  //     .put('/blogs/' + -3)
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       name: 'val_name update',
  //       description: 'valid description update',
  //       websiteUrl: 'https://valid-Url-update.com',
  //     })
  //     .expect(HttpStatus.NOT_FOUND);
  // });
  // it("12 - shouldn't update blog with incorrect input data", async () => {
  //   const { createdBlog1 } = expect.getState();
  //   await request(app.getHttpServer())
  //     .put('/blogs/' + createdBlog1.id)
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send({
  //       name: 'invalid long name update',
  //       description: 'valid description update',
  //       websiteUrl: 'https://valid-Url-update.com',
  //     })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   await request(app.getHttpServer())
  //     .get('/blogs/' + createdBlog1.id)
  //     .expect(HttpStatus.OK, createdBlog1);
  // });

  it('13 – PUT:/blogs – return 202 & update blog', async () => {
    const { firstCreatedBlog } = expect.getState();
    const firstUpdateBlog = {
      name: 'val_name update',
      description: 'valid description update',
      websiteUrl: 'https://valid-Url-update.com',
    };
    await request(app.getHttpServer())
      .put('/blogs/' + firstCreatedBlog.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: firstUpdateBlog.name,
        description: firstUpdateBlog.description,
        websiteUrl: firstUpdateBlog.websiteUrl,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/blogs/' + firstCreatedBlog.id)
      .expect(HttpStatus.OK, {
        ...firstCreatedBlog,
        name: firstUpdateBlog.name,
        description: firstUpdateBlog.description,
        websiteUrl: firstUpdateBlog.websiteUrl,
      });
  });

  it('14 - return 404 for delete non-exist blog', async () => {
    await request(app.getHttpServer())
      .delete('/blogs/1')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('15 - return 201 - create posts current blog', async () => {
    const { createdBlog1 } = expect.getState();
    const createPostResponse = await request(app.getHttpServer())
      .post(`/blogs/${createdBlog1.id}/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      });

    expect(createPostResponse).toBeDefined();
    expect(createPostResponse.status).toBe(HttpStatus.CREATED);
    expect(createPostResponse.body).toEqual({
      id: expect.any(String),
      title: 'valid-title',
      shortDescription: 'valid-shortDescription',
      content: 'valid-content',
      blogId: createdBlog1.id,
      blogName: 'val_name update',
      createdAt: expect.any(String),
    });

    expect.setState({ createdPost: createPostResponse.body });
  });
  it('16 - return 200 - get posts current blog with pagination', async () => {
    const { createdBlog1, createdPost } = expect.getState();
    const getPostsRequest = await request(app.getHttpServer()).get(
      `/blogs/${createdBlog1.id}/posts`,
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

  it('17 - delete both blogs', async () => {
    const { createdBlog1, createdBlog2 } = expect.getState();
    await request(app.getHttpServer())
      .delete('/blogs/' + createdBlog1.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/blogs/' + createdBlog1.id)
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .get('/blogs')
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlog2],
      });

    await request(app.getHttpServer())
      .delete('/blogs/' + createdBlog2.id)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/blogs/' + createdBlog2.id)
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
});

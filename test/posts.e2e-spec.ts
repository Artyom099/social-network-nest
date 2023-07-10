import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LikeStatus } from '../src/utils/constants';
import { appSettings } from '../src/settings';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();

    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  it('1 – POST:/users – create 1st user by admin', async () => {
    const firstUser = {
      login: 'lg-111111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };
    const firstCreateResponse = await request(app.getHttpServer())
      .post('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
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

    expect.setState({ firstUser, firstCreateResponse, firstCreatedUser });
  });
  it('2 – POST:/users – create 2nd user by admin', async () => {
    const { firstCreatedUser } = expect.getState();
    const secondUser = {
      login: 'lg-222222',
      password: 'qwerty2',
      email: 'artyomgolubev2@gmail.com',
    };
    const secondCreateResponse = await request(app.getHttpServer())
      .post('/users')
      // .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: secondUser.login,
        password: secondUser.password,
        email: secondUser.email,
      })
      .expect(HttpStatus.CREATED);

    const secondCreatedUser = secondCreateResponse.body;
    expect(secondCreatedUser).toEqual({
      id: expect.any(String),
      login: secondUser.login,
      email: secondUser.email,
      createdAt: expect.any(String),
    });

    await request(app.getHttpServer())
      .get('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [firstCreatedUser, secondCreatedUser],
      });

    expect.setState({
      secondUser: secondUser,
      secondCreateResponse: secondCreateResponse,
    });
  });
  it('3 – POST:/users – create 3rd user by admin', async () => {
    const thirdUser = {
      login: 'lg-333333',
      password: 'qwerty3',
      email: 'artyomgolubev3@gmail.com',
    };
    await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: thirdUser.login,
        password: thirdUser.password,
        email: thirdUser.email,
      })
      .expect(HttpStatus.CREATED);

    expect.setState({ thirdUser: thirdUser });
  });
  it('4 – POST:/users – create 4th user by admin', async () => {
    const fourthUser = {
      login: 'lg-444444',
      password: 'qwerty4',
      email: 'artyomgolubev4@gmail.com',
    };
    await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: fourthUser.login,
        password: fourthUser.password,
        email: fourthUser.email,
      })
      .expect(HttpStatus.CREATED);

    expect.setState({ fourthUser: fourthUser });
  });
  it('5 – POST:/users – create 5th user by admin', async () => {
    const fifthUser = {
      login: 'lg-555555',
      password: 'qwerty5',
      email: 'artyomgolubev5@gmail.com',
    };
    await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: fifthUser.login,
        password: fifthUser.password,
        email: fifthUser.email,
      })
      .expect(HttpStatus.CREATED);

    expect.setState({ fifthUser: fifthUser });
  });

  // it('6 – POST: /auth/login – return 200, 1st user login and refreshToken', async () => {
  //   const { firstUser } = expect.getState();
  //   const loginResponse = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({
  //       loginOrEmail: firstUser.login,
  //       password: firstUser.password,
  //     });
  //
  //   expect(loginResponse).toBeDefined();
  //   expect(loginResponse.status).toBe(HttpStatus.OK);
  //   expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
  //   const { accessToken } = loginResponse.body;
  //
  //   const refreshToken = getRefreshTokenByResponse(loginResponse);
  //   const refreshTokenWithName =
  //     getRefreshTokenByResponseWithTokenName(loginResponse);
  //   expect(refreshToken).toBeDefined();
  //   expect(refreshToken).toEqual(expect.any(String));
  //
  //   expect.setState({
  //     firstAccessToken: accessToken,
  //     firstRefreshToken: refreshToken,
  //     firstRefreshTokenWithName: refreshTokenWithName,
  //   });
  // });

  it('7 – POST:/blogs – return 201 & create blog by 1st user', async () => {
    const firstBlog = {
      name: 'valid-blog',
      description: 'valid-description',
      websiteUrl: 'valid-websiteUrl.com',
    };
    const createBlogResponse = await request(app.getHttpServer())
      .post('/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: firstBlog.name,
        description: firstBlog.description,
        websiteUrl: firstBlog.websiteUrl,
      });
    expect(createBlogResponse).toBeDefined();
    expect(createBlogResponse.status).toEqual(HttpStatus.CREATED);
    expect(createBlogResponse.body).toEqual({
      id: expect.any(String),
      name: firstBlog.name,
      description: firstBlog.description,
      websiteUrl: firstBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
    console.log({ firstCreatedBlog: createBlogResponse.body });
    expect.setState({ firstCreatedBlog: createBlogResponse.body });
  });
  it('8 – POST:/posts – return 201 & create post by 1st user', async () => {
    const { firstCreatedBlog } = expect.getState();
    const firstPost = {
      title: 'valid-title',
      shortDescription: 'valid-shortDescription',
      content: 'valid-content',
    };
    const createPostResponse = await request(app.getHttpServer())
      .post('/posts')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: firstPost.title,
        shortDescription: firstPost.shortDescription,
        content: firstPost.content,
        blogId: firstCreatedBlog.id,
      });
    expect(createPostResponse).toBeDefined();
    expect(createPostResponse.status).toEqual(HttpStatus.CREATED);
    expect(createPostResponse.body).toEqual({
      id: expect.any(String),
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstCreatedBlog.id,
      blogName: firstCreatedBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    });
    expect.setState({ firstPost: createPostResponse.body });
    console.log({ firstPost: createPostResponse.body });
  });

  it('9 – GET:/posts – return 200 and empty array', async () => {
    const { firstRefreshToken, firstPost, firstCreatedBlog } =
      expect.getState();
    const getPosts = await request(app.getHttpServer())
      .get('/posts')
      .auth(firstRefreshToken, { type: 'bearer' });

    expect(getPosts).toBeDefined();
    expect(getPosts.status).toEqual(HttpStatus.OK);
    expect(getPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: firstPost.id,
          title: firstPost.title,
          shortDescription: firstPost.shortDescription,
          content: firstPost.content,
          blogId: firstCreatedBlog.id,
          blogName: firstPost.blogName,
          createdAt: firstPost.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: firstPost.extendedLikesInfo.myStatus,
            newestLikes: [],
          },
        },
      ],
    });
  });
  it('10 – GET:/posts/:id – return 404 with not existing postId', async () => {
    const { firstAccessToken } = expect.getState();
    await request(app.getHttpServer())
      .get('/posts/123')
      .auth(firstAccessToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('11 – PUT:/posts/:id – return 404 with not existing postId', async () => {
    await request(app.getHttpServer())
      .put('/posts/123')
      .expect(HttpStatus.NOT_FOUND);
  });
  it('12 – PUT:/posts/:id – return 204 & update post', async () => {
    const firstUpdatePost = {
      title: 'valid-title-update',
      shortDescription: 'valid-shortDescription-update',
      content: 'valid-content-update',
    };
    const { firstPost } = expect.getState();
    await request(app.getHttpServer())
      .put(`/posts/${firstPost.id}`)
      .send({
        title: firstUpdatePost.title,
        shortDescription: firstUpdatePost.shortDescription,
        content: firstUpdatePost.content,
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('13 – DELETE:/posts/:id – return 404 with not existing postId', async () => {
    await request(app.getHttpServer())
      .delete('/posts/123')
      .expect(HttpStatus.NOT_FOUND);
  });
  it('14 – DELETE:/posts/:id – return 204 & delete post', async () => {
    const { firstPost } = expect.getState();
    await request(app.getHttpServer())
      .delete(`/posts/${firstPost.id}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  // it('11 – PUT:/posts/:id/like-status – return 204 & set like', async () => {
  //   const { firstAccessToken, firstPost } = expect.getState();
  //   const setLike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(firstAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Like });
  //
  //   expect(setLike).toBeDefined();
  //   expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('12 – GET: /posts/:id – return 200 & get post with 1 like', async () => {
  //   const { firstAccessToken, firstPost, firstUser, firstCreatedUser } =
  //     expect.getState();
  //   const getPost = await request(app.getHttpServer())
  //     .get(`/posts/${firstPost.id}`)
  //     .auth(firstAccessToken, { type: 'bearer' });
  //
  //   expect(getPost).toBeDefined();
  //   expect(getPost.status).toEqual(HttpStatus.OK);
  //   expect(getPost.body).toEqual({
  //     id: firstPost.id,
  //     title: firstPost.title,
  //     shortDescription: firstPost.shortDescription,
  //     content: firstPost.content,
  //     blogId: firstPost.blogId,
  //     blogName: firstPost.blogName,
  //     createdAt: firstPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: 1,
  //       dislikesCount: 0,
  //       myStatus: LikeStatus.Like,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           userId: firstCreatedUser.id,
  //           login: firstUser.login,
  //         },
  //       ],
  //     },
  //   });
  // });
  // it('13 – PUT: /posts/:id/like-status – return 204 & set dislike', async () => {
  //   const { firstAccessToken, firstPost } = expect.getState();
  //   const setDislike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(firstAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Dislike });
  //
  //   expect(setDislike).toBeDefined();
  //   expect(setDislike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('14 – GET: /posts/:id – return 200 & get post with 1 dislike', async () => {
  //   const { firstAccessToken, firstPost } = expect.getState();
  //   const getPost = await request(app.getHttpServer())
  //     .get(`/posts/${firstPost.id}`)
  //     .auth(firstAccessToken, { type: 'bearer' });
  //
  //   expect(getPost).toBeDefined();
  //   expect(getPost.status).toEqual(HttpStatus.OK);
  //   expect(getPost.body).toEqual({
  //     id: firstPost.id,
  //     title: firstPost.title,
  //     shortDescription: firstPost.shortDescription,
  //     content: firstPost.content,
  //     blogId: firstPost.blogId,
  //     blogName: firstPost.blogName,
  //     createdAt: firstPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: 0,
  //       dislikesCount: 1,
  //       myStatus: LikeStatus.Dislike,
  //       newestLikes: [],
  //     },
  //   });
  // });
  // it('15 – PUT: /posts/:id/like-status – return 204 & delete dislike', async () => {
  //   const { firstAccessToken, firstPost } = expect.getState();
  //   const setNone = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(firstAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.None });
  //
  //   expect(setNone).toBeDefined();
  //   expect(setNone.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('16 – GET: /posts/:id – return 200 & get post', async () => {
  //   const { firstAccessToken, firstPost } = expect.getState();
  //   const getPost = await request(app.getHttpServer())
  //     .get(`/posts/${firstPost.id}`)
  //     .auth(firstAccessToken, { type: 'bearer' });
  //
  //   expect(getPost).toBeDefined();
  //   expect(getPost.status).toEqual(HttpStatus.OK);
  //   expect(getPost.body).toEqual({
  //     id: firstPost.id,
  //     title: firstPost.title,
  //     shortDescription: firstPost.shortDescription,
  //     content: firstPost.content,
  //     blogId: firstPost.blogId,
  //     blogName: firstPost.blogName,
  //     createdAt: firstPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: 0,
  //       dislikesCount: 0,
  //       myStatus: LikeStatus.None,
  //       newestLikes: [],
  //     },
  //   });
  // });

  // it('17 – POST:/auth/login – return 200, 2nd user login and refreshToken', async () => {
  //   const { secondUser } = expect.getState();
  //   const secondLoginResponse = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({
  //       loginOrEmail: secondUser.login,
  //       password: secondUser.password,
  //     });
  //
  //   expect(secondLoginResponse).toBeDefined();
  //   expect(secondLoginResponse.status).toBe(HttpStatus.OK);
  //   expect(secondLoginResponse.body).toEqual({
  //     accessToken: expect.any(String),
  //   });
  //   const { accessToken } = secondLoginResponse.body;
  //
  //   expect.setState({ secondAccessToken: accessToken });
  // });
  // it('18 – POST: /auth/login – return 200, 3rd user login and refreshToken', async () => {
  //   const { thirdUser } = expect.getState();
  //   const thirdLoginResponse = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({
  //       loginOrEmail: thirdUser.login,
  //       password: thirdUser.password,
  //     });
  //
  //   expect(thirdLoginResponse).toBeDefined();
  //   expect(thirdLoginResponse.status).toBe(HttpStatus.OK);
  //   expect(thirdLoginResponse.body).toEqual({
  //     accessToken: expect.any(String),
  //   });
  //   const { accessToken } = thirdLoginResponse.body;
  //
  //   expect.setState({ thirdAccessToken: accessToken });
  // });
  // it('19 – POST: /auth/login – return 200, 4th user login and refreshToken', async () => {
  //   const { fourthUser } = expect.getState();
  //   const fourthLoginResponse = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({
  //       loginOrEmail: fourthUser.login,
  //       password: fourthUser.password,
  //     });
  //
  //   expect(fourthLoginResponse).toBeDefined();
  //   expect(fourthLoginResponse.status).toBe(HttpStatus.OK);
  //   expect(fourthLoginResponse.body).toEqual({
  //     accessToken: expect.any(String),
  //   });
  //   const { accessToken } = fourthLoginResponse.body;
  //
  //   expect.setState({ fourthAccessToken: accessToken });
  // });
  // it('20 – POST: /auth/login – return 200, 5th user login and refreshToken', async () => {
  //   const { fifthUser } = expect.getState();
  //   const fifthLoginResponse = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({
  //       loginOrEmail: fifthUser.login,
  //       password: fifthUser.password,
  //     });
  //
  //   expect(fifthLoginResponse).toBeDefined();
  //   expect(fifthLoginResponse.status).toBe(HttpStatus.OK);
  //   expect(fifthLoginResponse.body).toEqual({
  //     accessToken: expect.any(String),
  //   });
  //   const { accessToken } = fifthLoginResponse.body;
  //
  //   expect.setState({ fifthAccessToken: accessToken });
  // });

  // it('21 – PUT:/posts/:id/like-status – return 204 & set like by 2nd user', async () => {
  //   const { secondAccessToken, firstPost } = expect.getState();
  //   const setLike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(secondAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Like });
  //
  //   expect(setLike).toBeDefined();
  //   expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('22 – PUT: /posts/:id/like-status – return 204 & set like by 3rd user', async () => {
  //   const { thirdAccessToken, firstPost } = expect.getState();
  //   const setLike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(thirdAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Like });
  //
  //   expect(setLike).toBeDefined();
  //   expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('23 – PUT: /posts/:id/like-status – return 204 & set like by 4th user', async () => {
  //   const { fourthAccessToken, firstPost } = expect.getState();
  //   const setLike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(fourthAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Like });
  //
  //   expect(setLike).toBeDefined();
  //   expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  // it('24 – PUT: /posts/:id/like-status – return 204 & set like by 5th user', async () => {
  //   const { fifthAccessToken, firstPost } = expect.getState();
  //   const setLike = await request(app.getHttpServer())
  //     .put(`/posts/${firstPost.id}/like-status`)
  //     .auth(fifthAccessToken, { type: 'bearer' })
  //     .send({ likeStatus: LikeStatus.Like });
  //
  //   expect(setLike).toBeDefined();
  //   expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  //
  // it('25 – GET: /posts/:id – return 200 & get post by 1st user with 3 likes', async () => {
  //   const { firstAccessToken, firstPost, thirdUser, fourthUser, fifthUser } =
  //     expect.getState();
  //   const getPost = await request(app.getHttpServer())
  //     .get(`/posts/${firstPost.id}`)
  //     .auth(firstAccessToken, { type: 'bearer' });
  //
  //   expect(getPost).toBeDefined();
  //   expect(getPost.status).toEqual(HttpStatus.OK);
  //   expect(getPost.body).toEqual({
  //     id: firstPost.id,
  //     title: firstPost.title,
  //     shortDescription: firstPost.shortDescription,
  //     content: firstPost.content,
  //     blogId: firstPost.blogId,
  //     blogName: firstPost.blogName,
  //     createdAt: firstPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: 4,
  //       dislikesCount: 0,
  //       myStatus: LikeStatus.None,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: fifthUser.login,
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: fourthUser.login,
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: thirdUser.login,
  //         },
  //       ],
  //     },
  //   });
  // });
  // it('26 – GET: /posts – return 200 and post by 1st user with 3 likes', async () => {
  //   const {
  //     firstRefreshToken,
  //     firstPost,
  //     blogId,
  //     thirdUser,
  //     fourthUser,
  //     fifthUser,
  //   } = expect.getState();
  //   const getPosts = await request(app.getHttpServer())
  //     .get('/posts')
  //     .auth(firstRefreshToken, { type: 'bearer' });
  //
  //   expect(getPosts).toBeDefined();
  //   expect(getPosts.status).toEqual(HttpStatus.OK);
  //   expect(getPosts.body).toEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 1,
  //     items: [
  //       {
  //         id: firstPost.id,
  //         title: firstPost.title,
  //         shortDescription: firstPost.shortDescription,
  //         content: firstPost.content,
  //         blogId,
  //         blogName: firstPost.blogName,
  //         createdAt: firstPost.createdAt,
  //         extendedLikesInfo: {
  //           likesCount: 4,
  //           dislikesCount: 0,
  //           myStatus: firstPost.extendedLikesInfo.myStatus,
  //           newestLikes: [
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: fifthUser.login,
  //             },
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: fourthUser.login,
  //             },
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: thirdUser.login,
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LikeStatus } from '../src/infrastructure/utils/constants';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import {
  getRefreshTokenByResponse,
  getRefreshTokenByResponseWithTokenName,
} from '../src/infrastructure/utils/utils';

describe('PostsController (e2e)', () => {
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

  // создаю 5 пользователей
  it('1 – POST:/sa/users – create 1st user by admin', async () => {
    const firstUserInputModel = {
      login: 'lg-111111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };

    const firstCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: firstUserInputModel.login,
        password: firstUserInputModel.password,
        email: firstUserInputModel.email,
      })
      .expect(HttpStatus.CREATED);

    const firstCreatedUser = firstCreateResponse.body;
    expect(firstCreatedUser).toEqual({
      id: expect.any(String),
      login: firstUserInputModel.login,
      email: firstUserInputModel.email,
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
      firstUserInputModel,
      firstCreateResponse,
      firstCreatedUser,
    });
  });
  it('2 – POST:/sa/users – create 2nd user by admin', async () => {
    const { firstCreatedUser } = expect.getState();
    const secondUserInputModel = {
      login: 'lg-222222',
      password: 'qwerty2',
      email: 'artyomgolubev2@gmail.com',
    };

    const secondCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: secondUserInputModel.login,
        password: secondUserInputModel.password,
        email: secondUserInputModel.email,
      })
      .expect(HttpStatus.CREATED);

    const secondCreatedUser = secondCreateResponse.body;
    expect(secondCreatedUser).toEqual({
      id: expect.any(String),
      login: secondUserInputModel.login,
      email: secondUserInputModel.email,
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

    expect.setState({
      secondUserInputModel: secondUserInputModel,
      secondCreatedUser: secondCreatedUser,
      secondCreateResponse: secondCreateResponse,
    });
  });
  it('3 – POST:/sa/users – create 3rd user by admin', async () => {
    const thirdUserInputModel = {
      login: 'lg-333333',
      password: 'qwerty3',
      email: 'artyomgolubev3@gmail.com',
    };

    const thirdCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: thirdUserInputModel.login,
        password: thirdUserInputModel.password,
        email: thirdUserInputModel.email,
      })
      .expect(HttpStatus.CREATED);

    const thirdCreatedUser = thirdCreateResponse.body;

    expect.setState({ thirdUserInputModel, thirdCreatedUser });
  });
  it('4 – POST:/sa/users – create 4th user by admin', async () => {
    const fourthUserInputModel = {
      login: 'lg-444444',
      password: 'qwerty4',
      email: 'artyomgolubev4@gmail.com',
    };

    const fourthCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: fourthUserInputModel.login,
        password: fourthUserInputModel.password,
        email: fourthUserInputModel.email,
      })
      .expect(HttpStatus.CREATED);

    const fourthCreatedUser = fourthCreateResponse.body;

    expect.setState({ fourthUserInputModel, fourthCreatedUser });
  });
  it('5 – POST:/sa/users – create 5th user by admin', async () => {
    const fifthUserInputModel = {
      login: 'lg-555555',
      password: 'qwerty5',
      email: 'artyomgolubev5@gmail.com',
    };

    const fifthCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: fifthUserInputModel.login,
        password: fifthUserInputModel.password,
        email: fifthUserInputModel.email,
      })
      .expect(HttpStatus.CREATED);

    const fifthCreatedUser = fifthCreateResponse.body;

    expect.setState({ fifthUserInputModel, fifthCreatedUser });
  });

  // логиню первого блоггера
  it('6 – POST:/auth/login – return 200, 1st user login and refreshToken', async () => {
    const { firstUserInputModel } = expect.getState();

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: firstUserInputModel.login,
      password: firstUserInputModel.password,
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

  // создаю ему блог и пост
  it('7 – POST:/blogger/blogs – return 201 & create blog by 1st user', async () => {
    const { firstAccessToken } = expect.getState();
    const firstBlog = {
      name: 'valid-blog',
      description: 'valid-description',
      websiteUrl: 'valid-websiteUrl.com',
    };

    const createBlogResponse = await request(server)
      .post('/blogger/blogs')
      .auth(firstAccessToken, { type: 'bearer' })
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

    expect.setState({ firstCreatedBlog: createBlogResponse.body });
  });
  it('8 – POST:/blogger/blogs/:id/posts – return 201 & create post by 1st user', async () => {
    const { firstAccessToken, firstCreatedBlog } = expect.getState();
    const firstPost = {
      title: 'valid-title',
      shortDescription: 'valid-shortDescription',
      content: 'valid-content',
    };

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${firstCreatedBlog.id}/posts`)
      .auth(firstAccessToken, { type: 'bearer' })
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
  });

  it('9 – GET:/posts – return 200 and 1st post', async () => {
    const { firstAccessToken, firstPost, firstCreatedBlog } = expect.getState();

    const getPosts = await request(server)
      .get('/posts')
      .auth(firstAccessToken, { type: 'bearer' });

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
    await request(server)
      .get('/posts/123')
      .auth(firstAccessToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });
  it('11 – PUT:/posts/:id – return 404 with not existing postId', async () => {
    const { firstAccessToken } = expect.getState();
    const firstUpdatePost = {
      title: 'valid-title-update',
      shortDescription: 'valid-shortDescription-update',
      content: 'valid-content-update',
    };
    await request(server)
      .put('/posts/123')
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: firstUpdatePost.title,
        shortDescription: firstUpdatePost.shortDescription,
        content: firstUpdatePost.content,
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('12 – PUT:/blogger/blogs/:id/posts/:id – return 204 & update post', async () => {
    const { firstPost, firstCreatedBlog, firstAccessToken } = expect.getState();
    const firstUpdatePost = {
      title: 'valid-title-update',
      shortDescription: 'valid-shortDescription-update',
      content: 'valid-content-update',
    };

    await request(server)
      .put(`/blogger/blogs/${firstCreatedBlog.id}/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: firstUpdatePost.title,
        shortDescription: firstUpdatePost.shortDescription,
        content: firstUpdatePost.content,
      })
      .expect(HttpStatus.NO_CONTENT);

    expect.setState({ firstUpdatePost: firstUpdatePost });
  });

  it('13 – DELETE:/blogger/blogs/:id/posts/:id – return 404 with not existing postId', async () => {
    const { firstAccessToken } = expect.getState();

    await request(server)
      .delete('/posts/123')
      .auth(firstAccessToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });
  it('14 – DELETE:/blogger/blogs/:id/posts/:id – return 204 & delete post', async () => {
    const { firstPost, firstCreatedBlog, firstAccessToken } = expect.getState();

    await request(server)
      .delete(`/blogger/blogs/${firstCreatedBlog.id}/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('15 – POST:/blogger/blogs/:id/posts – return 201 & create 1st post by 1st user', async () => {
    const { firstCreatedBlog, firstPost, firstAccessToken } = expect.getState();

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${firstCreatedBlog.id}/posts`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: firstPost.title,
        shortDescription: firstPost.shortDescription,
        content: firstPost.content,
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
  });
  it('16 – POST:/blogger/blogs/:id/posts – return 201 & create 2nd post by 1st user', async () => {
    const { firstCreatedBlog, firstPost, firstAccessToken } = expect.getState();

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${firstCreatedBlog.id}/posts`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: firstPost.title,
        shortDescription: firstPost.shortDescription,
        content: firstPost.content,
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

    expect.setState({ secondPost: createPostResponse.body });
  });

  // лайк -> дизлайк -> удаление дизлайка
  it('16 – PUT:/posts/:id/like-status – return 204 & set like', async () => {
    const { firstAccessToken, firstPost } = expect.getState();

    const setLike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('17 – GET:/posts/:id – return 200 & get post with 1 like', async () => {
    const { firstAccessToken, firstPost, firstCreatedUser } = expect.getState();

    const getPost = await request(server)
      .get(`/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getPost).toBeDefined();
    expect(getPost.status).toEqual(HttpStatus.OK);
    expect(getPost.body).toEqual({
      id: firstPost.id,
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstPost.blogId,
      blogName: firstPost.blogName,
      createdAt: firstPost.createdAt,
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstCreatedUser.id,
            login: firstCreatedUser.login,
          },
        ],
      },
    });
  });
  it('18 – PUT:/posts/:id/like-status – return 204 & set dislike', async () => {
    const { firstAccessToken, firstPost } = expect.getState();

    const setDislike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Dislike });

    expect(setDislike).toBeDefined();
    expect(setDislike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('19 – GET:/posts/:id – return 200 & get post with 1 dislike', async () => {
    const { firstAccessToken, firstPost } = expect.getState();

    const getPost = await request(server)
      .get(`/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getPost).toBeDefined();
    expect(getPost.status).toEqual(HttpStatus.OK);
    expect(getPost.body).toEqual({
      id: firstPost.id,
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstPost.blogId,
      blogName: firstPost.blogName,
      createdAt: firstPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: LikeStatus.Dislike,
        newestLikes: [],
      },
    });
  });
  it('20 – PUT:/posts/:id/like-status – return 204 & delete dislike', async () => {
    const { firstAccessToken, firstPost } = expect.getState();

    const setNone = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.None });

    expect(setNone).toBeDefined();
    expect(setNone.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('21 – GET:/posts/:id – return 200 & get post', async () => {
    const { firstAccessToken, firstPost } = expect.getState();

    const getPost = await request(server)
      .get(`/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getPost).toBeDefined();
    expect(getPost.status).toEqual(HttpStatus.OK);
    expect(getPost.body).toEqual({
      id: firstPost.id,
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstPost.blogId,
      blogName: firstPost.blogName,
      createdAt: firstPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    });
  });

  // логиню остальных 4х пользователей
  it('22 – POST:/auth/login – return 200, 2nd user login and refreshToken', async () => {
    const { secondUserInputModel } = expect.getState();

    const secondLoginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: secondUserInputModel.login,
      password: secondUserInputModel.password,
    });

    expect(secondLoginResponse).toBeDefined();
    expect(secondLoginResponse.status).toBe(HttpStatus.OK);
    expect(secondLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const { accessToken } = secondLoginResponse.body;

    expect.setState({ secondAccessToken: accessToken });
  });
  it('23 – POST:/auth/login – return 200, 3rd user login and refreshToken', async () => {
    const { thirdUserInputModel } = expect.getState();
    const thirdLoginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: thirdUserInputModel.login,
      password: thirdUserInputModel.password,
    });

    expect(thirdLoginResponse).toBeDefined();
    expect(thirdLoginResponse.status).toBe(HttpStatus.OK);
    expect(thirdLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const { accessToken } = thirdLoginResponse.body;

    expect.setState({ thirdAccessToken: accessToken });
  });
  it('24 – POST:/auth/login – return 200, 4th user login and refreshToken', async () => {
    const { fourthUserInputModel } = expect.getState();
    const fourthLoginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: fourthUserInputModel.login,
      password: fourthUserInputModel.password,
    });

    expect(fourthLoginResponse).toBeDefined();
    expect(fourthLoginResponse.status).toBe(HttpStatus.OK);
    expect(fourthLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const { accessToken } = fourthLoginResponse.body;

    expect.setState({ fourthAccessToken: accessToken });
  });
  it('25 – POST:/auth/login – return 200, 5th user login and refreshToken', async () => {
    const { fifthUserInputModel } = expect.getState();
    const fifthLoginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: fifthUserInputModel.login,
      password: fifthUserInputModel.password,
    });

    expect(fifthLoginResponse).toBeDefined();
    expect(fifthLoginResponse.status).toBe(HttpStatus.OK);
    expect(fifthLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const { accessToken } = fifthLoginResponse.body;

    expect.setState({ fifthAccessToken: accessToken });
  });

  // они лайкают пост 1го пользователя
  it('26 – PUT:/posts/:id/like-status – return 204 & set like by 2nd user', async () => {
    const { secondAccessToken, firstPost } = expect.getState();
    const setLike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(secondAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('27 – PUT:/posts/:id/like-status – return 204 & set like by 3rd user', async () => {
    const { thirdAccessToken, firstPost } = expect.getState();
    const setLike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(thirdAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('28 – PUT:/posts/:id/like-status – return 204 & set like by 4th user', async () => {
    const { fourthAccessToken, firstPost } = expect.getState();
    const setLike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(fourthAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('29 – PUT:/posts/:id/like-status – return 204 & set like by 5th user', async () => {
    const { fifthAccessToken, firstPost } = expect.getState();
    const setLike = await request(server)
      .put(`/posts/${firstPost.id}/like-status`)
      .auth(fifthAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });

  // баню 2го пользователя
  it('30 – PUT:/sa/users/:id/ban – return 204 & ban 2nd user', async () => {
    const {
      fifthCreatedUser,
      fourthCreatedUser,
      thirdCreatedUser,
      secondCreatedUser,
      firstCreatedUser,
    } = expect.getState();
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

    expect(getUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 5,
      items: [
        fifthCreatedUser,
        fourthCreatedUser,
        thirdCreatedUser,
        secondBannedUser,
        firstCreatedUser,
      ],
    });

    expect.setState({ secondBannedUser });
  });

  it('31 – GET:/posts/:id – return 200 & get post by 1st user with 3 likes', async () => {
    const {
      firstAccessToken,
      firstPost,
      thirdUserInputModel,
      fourthUserInputModel,
      fifthUserInputModel,
    } = expect.getState();

    const getPost = await request(server)
      .get(`/posts/${firstPost.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getPost).toBeDefined();
    expect(getPost.status).toEqual(HttpStatus.OK);
    expect(getPost.body).toEqual({
      id: firstPost.id,
      title: firstPost.title,
      shortDescription: firstPost.shortDescription,
      content: firstPost.content,
      blogId: firstPost.blogId,
      blogName: firstPost.blogName,
      createdAt: firstPost.createdAt,
      extendedLikesInfo: {
        likesCount: 3,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: fifthUserInputModel.login,
          },
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: fourthUserInputModel.login,
          },
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: thirdUserInputModel.login,
          },
        ],
      },
    });
  });
  it('32 – GET:/posts – return 200 & get post by 1st user with 3 likes', async () => {
    const {
      firstAccessToken,
      firstPost,
      secondPost,
      thirdUserInputModel,
      fourthUserInputModel,
      fifthUserInputModel,
    } = expect.getState();

    const getPosts = await request(server)
      .get('/posts')
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getPosts).toBeDefined();
    expect(getPosts.status).toEqual(HttpStatus.OK);
    expect(getPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: secondPost.id,
          title: secondPost.title,
          shortDescription: secondPost.shortDescription,
          content: secondPost.content,
          blogId: secondPost.blogId,
          blogName: secondPost.blogName,
          createdAt: secondPost.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: secondPost.extendedLikesInfo.myStatus,
            newestLikes: [],
          },
        },
        {
          id: firstPost.id,
          title: firstPost.title,
          shortDescription: firstPost.shortDescription,
          content: firstPost.content,
          blogId: firstPost.blogId,
          blogName: firstPost.blogName,
          createdAt: firstPost.createdAt,
          extendedLikesInfo: {
            likesCount: 3,
            dislikesCount: 0,
            myStatus: firstPost.extendedLikesInfo.myStatus,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: fifthUserInputModel.login,
              },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: fourthUserInputModel.login,
              },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: thirdUserInputModel.login,
              },
            ],
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

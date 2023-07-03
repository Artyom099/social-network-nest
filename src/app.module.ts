import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { QueryRepository } from './query/query.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { TestController } from './test/test.controller';
import { TestRepository } from './test/test.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';

@Module({
  imports: [],
  controllers: [
    AppController,
    TestController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    AppService,
    TestRepository,
    QueryRepository,
    UsersService,
    UsersRepository,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class AppModule {}

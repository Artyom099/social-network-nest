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

@Module({
  imports: [],
  controllers: [
    AppController,
    TestController,
    UsersController,
    BlogsController,
    PostsController,
  ],
  providers: [
    AppService,
    TestRepository,
    UsersService,
    UsersRepository,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    QueryRepository,
  ],
})
export class AppModule {}

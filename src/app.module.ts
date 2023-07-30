import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsService } from './features/posts/application/posts.service';
import { PostsRepository } from './features/posts/infrastucture/posts.repository';
import { TestController } from './features/test/test.controller';
import { TestRepository } from './features/test/test.repository';
import { CommentsController } from './features/comments/api/comments.controller';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './features/blogs/blogs.schema';
import { User, UserSchema } from './features/users/users.schema';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query.repository';
import { PostsQueryRepository } from './features/posts/infrastucture/posts.query.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query.repository';
import { Post, PostSchema } from './features/posts/posts.schema';
import { Comment, CommentSchema } from './features/comments/comments.schema';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { BlogExistsConstraint } from './features/posts/api/posts.models';
import { IpService } from './infrastructure/services/ip.service';
import { Request, RequestSchema } from './infrastructure/services/ip.schema';
import { Device, DeviceSchema } from './features/devices/devices.schema';
import { CqrsModule } from '@nestjs/cqrs';

config();

@Module({
  imports: [
    // todo - зачем отдельно создвать эти 2 модуля?
    AuthModule,
    UsersModule,

    CqrsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
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

    IpService,
    TestRepository,
    BlogExistsConstraint,

    UsersService,
    UsersRepository,
    UsersQueryRepository,

    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class AppModule {}

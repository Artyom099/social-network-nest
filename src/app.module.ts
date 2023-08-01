import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { Post, PostSchema } from './features/posts/posts.schema';
import { Comment, CommentSchema } from './features/comments/comments.schema';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { BlogExistsConstraint } from './features/posts/api/posts.models';
import { Request, RequestSchema } from './infrastructure/services/ip.schema';
import { Device, DeviceSchema } from './features/devices/devices.schema';
import { CqrsModule } from '@nestjs/cqrs';
import { BindBlogUseCase } from './features/blogs/application/use.cases/bind.blog.use.case';

config();

const useCases = [BindBlogUseCase];

@Module({
  imports: [
    AuthModule,
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

    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    ...useCases,

    AppService,
    TestRepository,

    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsConstraint,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class AppModule {}

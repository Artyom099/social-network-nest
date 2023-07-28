import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './features/users/users.controller';
import { UsersService } from './features/users/users.service';
import { UsersRepository } from './features/users/users.repository';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { PostsController } from './features/posts/posts.controller';
import { PostsService } from './features/posts/posts.service';
import { PostsRepository } from './features/posts/posts.repository';
import { TestController } from './features/test/test.controller';
import { TestRepository } from './features/test/test.repository';
import { CommentsController } from './features/comments/comments.controller';
import { CommentsService } from './features/comments/comments.service';
import { CommentsRepository } from './features/comments/comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './features/blogs/blogs.schema';
import { User, UserSchema } from './features/users/users.schema';
import { CommentsQueryRepository } from './features/comments/comments.query.repository';
import { PostsQueryRepository } from './features/posts/posts.query.repository';
import { BlogsQueryRepository } from './features/blogs/blogs.query.repository';
import { UsersQueryRepository } from './features/users/users.query.repository';
import { Post, PostSchema } from './features/posts/posts.schema';
import { Comment, CommentSchema } from './features/comments/comments.schema';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { DevicesService } from './features/devices/devices.service';
import { DevicesRepository } from './features/devices/devices.repository';
import { DevicesController } from './features/devices/devices.controller';
import { Device, DeviceSchema } from './features/devices/devices.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './features/auth/constants';
import { BlogExistsConstraint } from './features/posts/posts.models';
import { DevicesQueryRepository } from './features/devices/devices.query.repository';
import { IpService } from './infrastructure/services/ip.service';
import { Request, RequestSchema } from './infrastructure/services/ip.schema';

config();

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [
    AppController,
    TestController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    DevicesController,
  ],
  providers: [
    IpService,
    AppService,
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

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
})
export class AppModule {}

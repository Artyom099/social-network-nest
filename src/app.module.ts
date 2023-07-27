import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
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
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blogs.schema';
import { User, UserSchema } from './users/users.schema';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { UsersQueryRepository } from './users/users.query.repository';
import { Post, PostSchema } from './posts/posts.schema';
import { Comment, CommentSchema } from './comments/comments.schema';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SecurityService } from './security/security.service';
import { SecurityRepository } from './security/security.repository';
import { SecurityController } from './security/security.controller';
import { Session, SessionSchema } from './security/security.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { BlogExistsConstraint } from './posts/posts.models';

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
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
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
    SecurityController,
  ],
  providers: [
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

    SecurityService,
    SecurityRepository,
  ],
})
export class AppModule {}

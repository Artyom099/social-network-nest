import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/users.schema';
import { DevicesService } from '../devices/application/devices.service';
import { DevicesRepository } from '../devices/infrastructure/devices.repository';
import { Device, DeviceSchema } from '../devices/devices.schema';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repository';
import { DevicesQueryRepository } from '../devices/infrastructure/devices.query.repository';
import { IpService } from '../../infrastructure/services/ip.service';
import {
  Request,
  RequestSchema,
} from '../../infrastructure/services/ip.schema';
import { JwtModule } from '@nestjs/jwt';
import { DevicesController } from '../devices/api/devices.controller';
import { UsersService } from '../users/application/users.service';
import { SaUsersController } from '../users/api/controllers/sa.users.controller';
import { CreateUserByAdminUseCase } from '../users/application/sa.users.use.cases/create.user.use.case';
import { RegisterUserUseCase } from './application/use.cases/register.user.use.case';
import { BanUserUseCase } from '../users/application/sa.users.use.cases/ban.user.use.case';
import { CqrsModule } from '@nestjs/cqrs';
import { UnbanUserUseCase } from '../users/application/sa.users.use.cases/unban.user.use.case';
import { EmailAdapter } from '../../infrastructure/adapters/email.adapter';
import { EmailManager } from '../../infrastructure/services/email.manager';
import { DeleteUserUseCase } from '../users/application/sa.users.use.cases/delete.user.use.case';
import { ConfirmEmailUseCase } from './application/use.cases/confirm.email.use.case';
import { UpdateConfirmationCodeUseCase } from './application/use.cases/update.confirmation.code.use.case';
import { SendRecoveryCodeUseCase } from './application/use.cases/send.recovery.code.use.case';
import { UpdatePasswordUseCase } from './application/use.cases/update.password.use.case';
import { BloggerUsersController } from '../users/api/controllers/blogger.users.controller';
import {
  BannedUserForBlog,
  BannedUserForBlogSchema,
} from '../users/schemas/banned.users.for.blog.schema';
import { BanUserForCurrentBlogUseCase } from '../users/application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { BannedUsersForBlogRepository } from '../users/infrastructure/banned.users.for.blog.repository';
import { BlogsQueryRepository } from '../blogs/infrastructure/blogs.query.repository';
import { Blog, BlogSchema } from '../blogs/blogs.schema';

const useCases = [
  BanUserUseCase,
  UnbanUserUseCase,

  DeleteUserUseCase,
  ConfirmEmailUseCase,
  RegisterUserUseCase,
  UpdatePasswordUseCase,
  SendRecoveryCodeUseCase,
  CreateUserByAdminUseCase,

  BanUserForCurrentBlogUseCase,
  UpdateConfirmationCodeUseCase,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Request.name, schema: RequestSchema },
      { name: BannedUserForBlog.name, schema: BannedUserForBlogSchema },
    ]),
  ],
  controllers: [
    AuthController,

    SaUsersController,
    BloggerUsersController,

    DevicesController,
  ],
  providers: [
    ...useCases,

    IpService,
    AuthService,

    EmailAdapter,
    EmailManager,
    BlogsQueryRepository,

    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BannedUsersForBlogRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
  exports: [
    AuthService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BannedUsersForBlogRepository,
  ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { UsersRepository } from '../users/infrastructure/users.repository';
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
import { UsersController } from '../users/api/users.controller';
import { CreateUserByAdminUseCase } from './api/use.cases/create.user.use.case';
import { RegisterUserUseCase } from './api/use.cases/register.user.use.case';
import { BanUserUseCase } from './api/use.cases/ban.user.use.case';

const useCases = [
  CreateUserByAdminUseCase,
  RegisterUserUseCase,
  BanUserUseCase,
];

@Module({
  imports: [
    // UsersModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [AuthController, UsersController, DevicesController],
  providers: [
    ...useCases,

    IpService,

    AuthService,

    UsersService,
    UsersRepository,
    UsersQueryRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
  exports: [AuthService, UsersService, UsersRepository, UsersQueryRepository],
})
export class AuthModule {}

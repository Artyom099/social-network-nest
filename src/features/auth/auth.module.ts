import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
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

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [AuthController, DevicesController],
  providers: [
    IpService,

    AuthService,

    UsersRepository,
    UsersQueryRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}

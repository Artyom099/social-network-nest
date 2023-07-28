import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { UsersRepository } from '../users/users.repository';
import { DevicesService } from '../devices/devices.service';
import { DevicesRepository } from '../devices/devices.repository';
import { Device, DeviceSchema } from '../devices/devices.schema';
import { UsersQueryRepository } from '../users/users.query.repository';
import { DevicesQueryRepository } from '../devices/devices.query.repository';
import { IpService } from '../../infrastructure/services/ip.service';
import {
  Request,
  RequestSchema,
} from '../../infrastructure/services/ip.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  providers: [
    IpService,

    AuthService,
    AuthRepository,

    UsersRepository,
    UsersQueryRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

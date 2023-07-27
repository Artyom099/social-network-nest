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
import { Session, SessionSchema } from '../devices/devices.schema';
import { UsersQueryRepository } from '../users/users.query.repository';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  providers: [
    AuthService,
    DevicesService,
    // { provide: APP_GUARD, useClass: AuthGuard },
    // BasicStrategy,
    AuthRepository,
    UsersRepository,
    DevicesRepository,
    UsersQueryRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

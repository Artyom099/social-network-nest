import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { AuthRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { UsersRepository } from '../users/users.repository';
import { SecurityService } from '../security/security.service';
import { SecurityRepository } from '../security/security.repository';
import { Session, SessionSchema } from '../security/security.schema';
import { UsersQueryRepository } from '../users/users.query.repository';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  providers: [
    AuthService,
    SecurityService,
    // { provide: APP_GUARD, useClass: AuthGuard },
    // BasicStrategy,
    AuthRepository,
    UsersRepository,
    SecurityRepository,
    UsersQueryRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

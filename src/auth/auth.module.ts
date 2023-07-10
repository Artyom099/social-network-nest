import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { AuthRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    // { provide: APP_GUARD, useClass: AuthGuard },
    // BasicStrategy,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

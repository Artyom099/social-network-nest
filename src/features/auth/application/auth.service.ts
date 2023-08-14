import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EmailManager } from '../../../infrastructure/services/email.manager';
import { jwtConstants } from '../../../infrastructure/utils/settings';
import { CreateUserInputModel } from '../../users/api/models/create.user.input.model';
import { UserViewModel } from '../../users/api/models/user.view.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private emailManager: EmailManager,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(
    InputModel: CreateUserInputModel,
  ): Promise<UserViewModel | null> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.generateHash(
      InputModel.password,
      passwordSalt,
    );
    //создание умного юзера
    const user = await this.usersRepository.createUserBySelf(
      InputModel,
      passwordSalt,
      passwordHash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      await this.emailManager.sendEmailConfirmationMessage(
        user.accountData.email,
        user.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      await this.usersRepository.deleteUser(user.id);
      return null;
    }
    return user.getViewModel();
  }

  async checkCredentials(
    loginOrEmail,
    password,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.usersRepository.getUserDocumentByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return null;
    const passwordHash = await this.generateHash(
      password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    } else {
      const payload = { userId: user.id, deviceId: randomUUID() };
      return {
        accessToken: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.accessSecret,
          expiresIn: '5m',
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.refreshSecret,
          expiresIn: '20s',
        }),
      };
    }
  }

  async updateJWT(userId: string, deviceId: string) {
    const payload = { userId, deviceId };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessSecret,
        expiresIn: '5m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: '20s',
      }),
    };
  }

  async getTokenPayload(token: string): Promise<any | null> {
    try {
      // { userId: '1682507411257', deviceId: '1682507411257', iat: 1682507422, exp: 1682511022 }
      return this.jwtService.decode(token);
    } catch (e) {
      return null;
    }
  }

  async generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}

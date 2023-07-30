import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  CreateUserInputModel,
  UserViewModel,
} from '../../users/api/users.models';
import { emailManager } from '../../../infrastructure/services/email.manager';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { jwtConstants } from '../../../infrastructure/utils/settings';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    InputModel: CreateUserInputModel,
  ): Promise<UserViewModel | null> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
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
      await emailManager.sendEmailConfirmationMessage(
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
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return null;
    const passwordHash = await this._generateHash(
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

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByConfirmationCode(
      code,
    );
    if (!user) {
      return false;
    }
    if (!user.confirmEmail(code)) {
      return false;
    } else {
      await this.usersRepository.save(user);
      await this.usersQueryRepository.getUserByConfirmationCode(code);
      return true;
    }
  }

  async updateConfirmationCode(email: string): Promise<string | null> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    //обновили у него ConfirmationCode
    const newConfirmationCode = user.updateConfirmationCode();
    //записали это обновление в БД
    await this.usersRepository.save(user);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      await emailManager.sendEmailConfirmationMessage(
        email,
        newConfirmationCode,
      );
    } catch (error) {
      return null;
    }
    return newConfirmationCode;
  }

  async sendRecoveryCode(email: string): Promise<string | null> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    const recoveryCode = user.updateRecoveryCode();
    await this.usersRepository.save(user);
    try {
      //await
      await emailManager.sendEmailRecoveryCode(email, recoveryCode);
    } catch (error) {
      return null;
    }
    return recoveryCode;
  }

  async updatePassword(code: string, password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);

    const user = await this.usersQueryRepository.getUserByRecoveryCode(code);
    if (!user) return null;

    user.updateSaltAndHash(passwordSalt, passwordHash);
    await this.usersRepository.save(user);
  }

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}

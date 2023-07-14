import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../users/users.repository';
import {
  CreateUserInputModel,
  UserDBModel,
  UserViewModel,
} from '../users/users.models';
import { User } from '../users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    // private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
  ) {}

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDBModel | null> {
    return this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
  }

  async createUser(
    InputModel: CreateUserInputModel,
  ): Promise<UserViewModel | null> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      InputModel.password,
      passwordSalt,
    );

    //создание умного юзера
    const smartUser = User.createUserBySelf(
      InputModel,
      passwordSalt,
      passwordHash,
    );
    // сохранение умного юзера через репозиторий
    // await this.usersRepository.createUser(smartUser);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      // await emailManager.sendEmailConfirmationMessage(
      //   email,
      //   newUser.emailConfirmation.confirmationCode,
      // );
    } catch (error) {
      await this.usersRepository.deleteUser(smartUser.id);
      return null;
    }
    // возврщение ViewModel умного юзера
    return smartUser.getViewModel();
  }

  async checkCredentials(
    loginOrEmail,
    password,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
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
          expiresIn: '5m',
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '20s',
        }),
      };
    }
  }

  getTokenPayload(
    token: string,
  ): { userId: string; deviceId: string; iat: number; exp: number } | null {
    // { userId: '1682507411257', deviceId: '1682507411257', iat: 1682507422, exp: 1682511022 }
    const payload = this.jwtService.decode(token);
    if (typeof payload === 'string' || payload === null) {
      return null;
    } else {
      return {
        deviceId: payload.deviceId,
        exp: payload.exp,
        iat: payload.iat,
        userId: payload.userId,
      };
    }
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    if (!user) {
      return false;
    } else {
      user.confirmEmail(code);
      await this.usersRepository.updateUser(user.id, user);
      return true;
    }
  }

  async updateConfirmationCode(email: string): Promise<string | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    //обновили у него ConfirmationCode
    const newConfirmationCode = user.updateConfirmationCode();
    //записали это обновление в БД
    await this.usersRepository.updateUser(user.id, user);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      // await emailManager.sendEmailConfirmationMessage(email, newConfirmationCode);
    } catch (error) {
      return null;
    }
    return newConfirmationCode;
  }

  async sendRecoveryCode(email: string) {
    const user = await this.usersRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    const recoveryCode = user.updateRecoveryCode();
    await this.usersRepository.updateUser(user.id, user);

    try {
      // await emailManager.sendEmailRecoveryCode(email, recoveryCode);
    } catch (error) {
      return null;
    }
    return recoveryCode;
  }

  async checkRecoveryCode(code: string) {
    return this.usersRepository.getUserByRecoveryCode(code);
  }

  async updatePassword(code: string, password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);

    const user = await this.usersRepository.getUserByRecoveryCode(code);
    if (!user) return null;

    user.updateSaltAndHash(passwordSalt, passwordHash);
    await this.usersRepository.updateUser(user.id, user);
  }

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}

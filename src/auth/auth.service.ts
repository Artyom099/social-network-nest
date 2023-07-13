import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../users/users.repository';
import { UserDBModel, UserViewModel } from '../users/users.models';
import add from 'date-fns/add';
import { User } from '../users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
  ) {}

  async getUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.getUserById(userId);
  }
  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDBModel | null> {
    return this.authRepository.getUserByLoginOrEmail(loginOrEmail);
  }
  async createUser(login: string, password: string, email: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);
    const newUser: UserDBModel = {
      id: randomUUID(),
      accountData: {
        login,
        email,
        passwordHash,
        passwordSalt,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: false,
      },
      recoveryCode: '',
    };
    // todo - нормально, что AuthService использеут метод usersRepository?
    const user = this.usersRepository.createUser(newUser);
    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      // await emailManager.sendEmailConfirmationMessage(
      //   email,
      //   newUser.emailConfirmation.confirmationCode,
      // );
    } catch (error) {
      await this.usersRepository.deleteUser(newUser.id);
      return null;
    }
    return user;
  }

  async checkCredentials(
    loginOrEmail,
    password,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.authRepository.getUserByLoginOrEmail(loginOrEmail);
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
    // проверка кода на правильность, срок жизни и повторное использование
    const user = await this.authRepository.getUserByConfirmationCode(code);

    // if (user.canBeConfirmed(code)) {
    //   user.confirm();
    //   const result = await this.authRepository.save(user);
    //   return result;
    // }

    if (
      user &&
      !user.emailConfirmation.isConfirmed &&
      user.emailConfirmation.confirmationCode === code &&
      user.emailConfirmation.expirationDate > new Date()
    ) {
      await this.authRepository.updateEmailConfirmation(user.id);
      return true;
    } else {
      return false;
    }
  }
  async updateConfirmationCode(email: string): Promise<string | null> {
    //достали тупого юзер
    const user = await this.usersRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    //сделали его умным
    const smartUser = User.createUserClass(user);
    //обновили у него ConfirmationCode
    const newConfirmationCode = smartUser.updateConfirmationCode();
    //записали это обновление в БД - todo - smartUser или user?
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
    //достали тупого юзер
    const user = await this.usersRepository.getUserByLoginOrEmail(email);
    if (!user) return null;
    //сделали его умным
    const smartUser = User.createUserClass(user);
    //обновили у него recoveryCode
    const recoveryCode = smartUser.setRecoveryCode();
    //записали это обновление в БД - todo - smartUser или user?
    await this.usersRepository.updateUser(user.id, smartUser);

    try {
      // await emailManager.sendEmailRecoveryCode(email, recoveryCode);
    } catch (error) {
      return null;
    }
    return recoveryCode;
  }

  async checkRecoveryCode(code: string) {
    return this.authRepository.getUserByRecoveryCode(code);
  }

  async updatePassword(code: string, password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);
    await this.authRepository.updateSaltAndHash(
      code,
      passwordSalt,
      passwordHash,
    );
  }

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}

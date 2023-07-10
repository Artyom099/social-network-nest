import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../users/users.repository';
import { UserDBModel, UserViewModel } from '../users/users.models';
import add from 'date-fns/add';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
  ) {}

  // async signIn(username, pass) {
  //   const user = await this.usersService.findOne(username);
  //   if (user?.password !== pass) {
  //     throw new UnauthorizedException();
  //   } else {
  //     const payload = { username: user!.username, sub: user!.userId };
  //     return { access_token: await this.jwtService.signAsync(payload) };
  //   }
  // }

  async getUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.getUser(userId);
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
      //todo - здевсь обращаться в сервис или в репозиторий?
      await this.usersService.deleteUser(newUser.id);
      return null;
    }
    return user;
  }

  async checkCredentials(loginOrEmail, password) {
    const user = await this.authRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user) return null;
    const passwordHash = await this._generateHash(
      password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    } else {
      const payload = { userId: user.id };
      return { access_token: await this.jwtService.signAsync(payload) };
      //todo - добавить рефреш токен в куки
    }
  }

  async checkConfirmationCode(code: string): Promise<boolean> {
    // проверка кода на правильность, срок жизни и повторное использование
    const user = await this.authRepository.getUserByConfirmationCode(code);
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

  async sendRecoveryCode(email: string) {
    const recoveryCode = randomUUID();
    await this.authRepository.setRecoveryCode(email, recoveryCode);
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

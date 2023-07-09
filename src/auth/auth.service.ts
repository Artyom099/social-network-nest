import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  async signIn(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    } else {
      const payload = { username: user!.username, sub: user!.userId };
      return { access_token: await this.jwtService.signAsync(payload) };
    }
  }

  async checkCredentials(loginOrEmail, password) {
    const user = await this.authRepository.getUser(loginOrEmail);
    if (!user) return null;
    const passwordHash = await this._generateHash(
      password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    } else {
      const payload = { userId: user!.id };
      return { access_token: await this.jwtService.signAsync(payload) };
    }
  }

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}

import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { SaltHashModel } from '../api/users.models';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }

  async generateSaltAndHash(password: string): Promise<SaltHashModel> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }
}

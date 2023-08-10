import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SaltHashModel } from '../api/models/salt.hash.model';

@Injectable()
export class UsersService {
  async generateSaltAndHash(password: string): Promise<SaltHashModel> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }
}

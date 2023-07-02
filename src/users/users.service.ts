import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersService) {}
  getUser(term: string) {
    return this.usersRepository.getUser(term);
  }
}

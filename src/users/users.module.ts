import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  // imports: [UsersRepository],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

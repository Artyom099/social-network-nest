import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { QueryRepository } from './query/query.repository';

@Module({
  imports: [],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, UsersRepository, QueryRepository],
})
export class AppModule {}

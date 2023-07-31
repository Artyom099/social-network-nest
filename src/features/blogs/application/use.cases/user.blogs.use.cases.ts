import { ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UserBlogsCommand {
  constructor() {}
}

export class UserBlogsUseCases implements ICommandHandler<UserBlogsCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UserBlogsCommand) {
    console.log(command);
    return { status: 'OK' };
  }
}

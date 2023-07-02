import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}
}

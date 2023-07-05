import { CommentsRepository } from './comments.repository';
import { CommentViewModel } from './comments.models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async getComment(commentId: string): Promise<CommentViewModel> {
    return this.commentsRepository.getComment(commentId);
  }
}

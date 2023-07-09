import { CommentsRepository } from './comments.repository';
import { CommentInputModel, CommentViewModel } from './comments.models';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async getComment(commentId: string): Promise<CommentViewModel | null> {
    return this.commentsRepository.getComment(commentId);
  }

  async updateComment(commentId: string, content: CommentInputModel) {
    await this.commentsRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: string) {
    await this.commentsRepository.deleteComment(commentId);
  }

  async updateCommentLikes(commentId: string, likeStatus: LikeStatus) {
    return this.commentsRepository.updateCommentLikes(commentId, likeStatus);
  }
}

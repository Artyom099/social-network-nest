import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentDBModel, CommentViewModel } from '../api/comments.models';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { randomUUID } from 'crypto';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const createdComment: CommentDBModel = {
      id: randomUUID(),
      postId,
      content: content.toString(),
      commentatorInfo: {
        userId,
        userLogin,
      },
      createdAt: new Date().toISOString(),
      likesInfo: [],
    };
    return this.commentsRepository.createComment(createdComment);
  }

  async updateComment(commentId: string, content: string) {
    await this.commentsRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: string) {
    await this.commentsRepository.deleteComment(commentId);
  }

  async updateCommentLikes(
    commentId: string,
    currentUserId: string,
    likeStatus: LikeStatus,
  ) {
    return this.commentsRepository.updateCommentLikes(
      commentId,
      currentUserId,
      likeStatus,
    );
  }
}

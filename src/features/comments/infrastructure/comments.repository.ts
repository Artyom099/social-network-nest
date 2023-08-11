import { LikeStatus } from '../../../infrastructure/utils/constants';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../comments.schema';
import { Model } from 'mongoose';
import { CommentViewModel } from '../api/models/comment.view.model';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(comment: Comment): Promise<CommentViewModel> {
    await this.commentModel.create(comment);
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      postInfo: {
        id: comment.postInfo.id,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    };
  }

  async updateComment(id: string, content: string) {
    await this.commentModel.updateOne({ id }, { content });
  }
  async deleteComment(id: string) {
    await this.commentModel.deleteOne({ id });
  }
  async updateCommentLikes(
    id: string,
    currentUserId: string,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentModel.findOne({ id });
    if (!comment) return false;
    // если юзер есть в массиве likesInfo, обновляем его статус
    for (const s of comment.likesInfo) {
      if (s.userId === currentUserId) {
        if (s.status === newLikeStatus) return true;
        await this.commentModel.updateOne(
          { id },
          {
            likesInfo: {
              userId: currentUserId,
              status: newLikeStatus,
            },
          },
        );
        return true;
      }
    }
    // иначе добавляем юзера и его статус в массив
    await this.commentModel.updateOne(
      { id },
      {
        $addToSet: {
          likesInfo: { userId: currentUserId, status: newLikeStatus },
        },
      },
    );
    return true;
  }
}

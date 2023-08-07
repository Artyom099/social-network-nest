import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../infrastructure/utils/constants';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateCommentModel } from './api/models/comments.models';

@Schema({ _id: false, versionKey: false })
class CommentatorInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
}
const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false, versionKey: false })
class LikesInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true, default: LikeStatus.None })
  status: LikeStatus;
}
const LikesInfoSchema = SchemaFactory.createForClass<LikesInfo>(LikesInfo);

export type CommentDocument = HydratedDocument<Comment>;
@Schema({ versionKey: false })
export class Comment {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  content: string;
  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ type: [LikesInfoSchema], required: true })
  likesInfo: LikesInfo[];

  static create(inputModel: CreateCommentModel) {
    const comment = new Comment();
    comment.id = randomUUID();
    comment.postId = inputModel.postId;
    comment.content = inputModel.content;
    comment.commentatorInfo = {
      userId: inputModel.userId,
      userLogin: inputModel.userLogin,
    };
    comment.createdAt = new Date();
    comment.likesInfo = [];
    return comment;
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

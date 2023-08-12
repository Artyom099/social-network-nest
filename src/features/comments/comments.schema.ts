import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../infrastructure/utils/constants';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateCommentModel } from './api/models/create.comment.model';

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

@Schema({ _id: false, versionKey: false })
class PostInfo {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
}
const PostInfoSchema = SchemaFactory.createForClass(PostInfo);

export type CommentDocument = HydratedDocument<Comment>;
@Schema({ versionKey: false })
export class Comment {
  @Prop({ required: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  content: string;
  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true, type: [LikesInfoSchema] })
  likesInfo: LikesInfo[];
  @Prop({ required: true, type: PostInfoSchema })
  postInfo: PostInfo;

  static create(inputModel: CreateCommentModel) {
    const comment = new Comment();
    comment.id = randomUUID();
    comment.content = inputModel.content;
    comment.createdAt = new Date();
    comment.commentatorInfo = {
      userId: inputModel.userId,
      userLogin: inputModel.userLogin,
    };
    comment.likesInfo = [];
    comment.postInfo = {
      id: inputModel.postId,
      title: inputModel.title,
      blogId: inputModel.blogId,
      blogName: inputModel.blogName,
    };
    return comment;
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../utils/constants';
import { HydratedDocument } from 'mongoose';

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
  id: string;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  content: string;
  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorIno: CommentatorInfo;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ type: [LikesInfoSchema], required: true })
  likesInfo: LikesInfo[];
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema()
export class Session {
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: Date, required: true })
  lastActiveDate: Date;
  @Prop({ type: String, required: true })
  deviceId: string;
  @Prop({ type: String, required: true })
  userId: string;

  static create(
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string,
  ) {
    const session = new Session();
    session.ip = ip;
    session.title = title;
    session.lastActiveDate = lastActiveDate;
    session.deviceId = deviceId;
    session.userId = userId;
    return session;
  }
}
export const SessionSchema = SchemaFactory.createForClass(Session);

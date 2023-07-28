import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RequestDocument = HydratedDocument<Request>;

@Schema({ versionKey: false })
export class Request {
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  url: string;
  @Prop({ type: Date, required: true })
  date: Date;

  static create(ip: string, url: string, date: Date) {
    const request = new Request();
    request.ip = ip;
    request.url = url;
    request.date = date;
    return request;
  }
}
export const RequestSchema = SchemaFactory.createForClass(Request);

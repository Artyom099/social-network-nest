import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ versionKey: false })
export class Device {
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
    const device = new Device();
    device.ip = ip;
    device.title = title;
    device.lastActiveDate = lastActiveDate;
    device.deviceId = deviceId;
    device.userId = userId;
    return device;
  }
}
export const DeviceSchema = SchemaFactory.createForClass(Device);

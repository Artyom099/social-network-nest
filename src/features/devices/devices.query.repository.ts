import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import { Model } from 'mongoose';
import { DeviceViewModel } from './devices.models';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async getSession(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await this.devicesModel.findOne({ deviceId }).exec();
    if (!device) return null;
    else
      return {
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate.toISOString(),
        deviceId: device.deviceId,
      };
  }
  //todo - : Promise<SessionViewModel[]>
  async getSessions(userId: string) {
    return this.devicesModel
      .find({ userId }, { projection: { _id: 0, userId: 0 } })
      .exec();
  }
}

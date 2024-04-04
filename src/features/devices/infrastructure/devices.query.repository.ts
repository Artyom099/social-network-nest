import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from '../devices.schema';
import { Model } from 'mongoose';
import { DeviceViewModel } from '../api/models/device.view.model';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async getDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await this.devicesModel.findOne({ deviceId }).exec();
    if (!device) return null;

    return this.mapToView(device);
  }

  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices = await this.devicesModel
      .find({ userId }, { projection: { _id: 0, userId: 0 } })
      .exec();

    return devices.map((d: DeviceDocument) => this.mapToView(d));
  }

  mapToView(device: DeviceDocument): DeviceViewModel {
    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate.toISOString(),
    };
  }
}

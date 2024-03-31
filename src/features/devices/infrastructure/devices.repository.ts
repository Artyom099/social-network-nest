import { Injectable } from '@nestjs/common';
import { DeviceDBModel } from '../api/models/device.db.model';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from '../devices.schema';
import { Model } from 'mongoose';
import { DeviceViewModel } from '../api/models/device.view.model';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async createSession(dto: DeviceDBModel): Promise<DeviceViewModel> {
    const device = await this.devicesModel.create(dto);

    return this.mapToView(device);
  }

  async updateLastActiveDate(deviceId: string, date: string) {
    return this.devicesModel.updateOne(
      { deviceId },
      { $set: { lastActiveDate: date } },
    );
  }

  async deleteCurrentSession(deviceId: string) {
    await this.devicesModel.deleteOne({ deviceId });
  }

  async deleteOtherSessions(deviceId: string) {
    await this.devicesModel.deleteMany({ $nor: [{ deviceId }] });
  }

  async deleteAllSessions(userId: string) {
    await this.devicesModel.deleteMany({ userId });
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

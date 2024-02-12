import { Injectable } from '@nestjs/common';
import { DeviceDBModel } from '../api/models/device.db.model';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from '../devices.schema';
import { Model } from 'mongoose';
import { DeviceViewModel } from '../api/models/device.view.model';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private sessionModel: Model<DeviceDocument>,
  ) {}

  async createSession(device: DeviceDBModel): Promise<DeviceViewModel> {
    await this.sessionModel.create(device);

    return this.mapToView(device);
  }

  async updateLastActiveDate(deviceId: string, date: string) {
    return this.sessionModel.updateOne(
      { deviceId },
      { $set: { lastActiveDate: date } },
    );
  }

  async deleteCurrentSession(deviceId: string) {
    await this.sessionModel.deleteOne({ deviceId });
  }

  async deleteOtherSessions(deviceId: string) {
    await this.sessionModel.deleteMany({ $nor: [{ deviceId }] });
  }

  async deleteAllSessions(userId: string) {
    return this.sessionModel.deleteMany({ userId });
  }

  mapToView(device): DeviceViewModel {
    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate.toISOString(),
    };
  }
}

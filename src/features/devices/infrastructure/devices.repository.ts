import { Injectable } from '@nestjs/common';
import { DeviceDBModel, DeviceViewModel } from '../api/models/devices.models';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from '../devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private sessionModel: Model<DeviceDocument>,
  ) {}

  async createSession(session: DeviceDBModel): Promise<DeviceViewModel> {
    await this.sessionModel.create(session);
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate.toISOString(),
      deviceId: session.deviceId,
    };
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
}

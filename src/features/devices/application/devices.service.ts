import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Device } from '../devices.schema';
import { DeviceViewModel } from '../api/models/devices.models';

@Injectable()
export class DevicesService {
  constructor(private securityRepository: DevicesRepository) {}

  async createSession(
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string,
  ): Promise<DeviceViewModel> {
    const session = Device.create(ip, title, lastActiveDate, deviceId, userId);
    return this.securityRepository.createSession(session);
  }
  async updateLastActiveDate(deviceId: string, date: string) {
    return this.securityRepository.updateLastActiveDate(deviceId, date);
  }

  async deleteCurrentSession(deviceId: string) {
    return this.securityRepository.deleteCurrentSession(deviceId);
  }
  async deleteOtherSessions(deviceId: string) {
    return this.securityRepository.deleteOtherSessions(deviceId);
  }
  async deleteAllSessions(userId: string) {
    return this.securityRepository.deleteAllSessions(userId);
  }
}

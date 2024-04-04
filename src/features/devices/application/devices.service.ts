import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Device } from '../devices.schema';
import { CreateDeviceModel } from '../api/models/create.device.model';
import { DeviceViewModel } from '../api/models/device.view.model';

@Injectable()
export class DevicesService {
  constructor(private securityRepository: DevicesRepository) {}

  async createDevice(dto: CreateDeviceModel): Promise<DeviceViewModel> {
    const session: Device = Device.create(
      dto.ip,
      dto.title,
      dto.lastActiveDate,
      dto.deviceId,
      dto.userId,
    );
    return this.securityRepository.createSession(session);
  }

  async updateLastActiveDate(deviceId: string, date: string) {
    return this.securityRepository.updateLastActiveDate(deviceId, date);
  }

  async deleteCurrentDevice(deviceId: string) {
    return this.securityRepository.deleteCurrentSession(deviceId);
  }

  async deleteOtherDevices(deviceId: string) {
    return this.securityRepository.deleteOtherSessions(deviceId);
  }

  async deleteAllDevices(userId: string) {
    return this.securityRepository.deleteAllSessions(userId);
  }
}

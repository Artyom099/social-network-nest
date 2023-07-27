import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { Session } from './devices.schema';
import { SessionViewModel } from './devices.models';

@Injectable()
export class DevicesService {
  constructor(private securityRepository: DevicesRepository) {}

  // async getSession(deviceId: string): Promise<SessionViewModel | null> {
  //   return this.securityRepository.getSession(deviceId);
  // }
  // async getSessions(userId: string) {
  //   return this.securityRepository.getSessions(userId);
  // }

  async createSession(
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string,
  ): Promise<SessionViewModel> {
    const session = Session.create(ip, title, lastActiveDate, deviceId, userId);
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
}

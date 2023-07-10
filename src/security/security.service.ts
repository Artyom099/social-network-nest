import { Injectable } from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { Session } from './security.schema';

@Injectable()
export class SecurityService {
  constructor(private securityRepository: SecurityRepository) {}

  async getSession(deviceId: string) {}
  async getSessions(userId: string) {}

  async createSession(
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string,
  ) {
    const session = Session.create(ip, title, lastActiveDate, deviceId, userId);
    return this.securityRepository.createSession(session);
  }
  async updateLastActiveDate(deviceId: string, date: string) {
    return this.securityRepository.updateLastActiveDate(deviceId, date);
  }

  async deleteCurrentSession(deviceId: string) {}
  async deleteOtherSessions(deviceId: string) {}
}

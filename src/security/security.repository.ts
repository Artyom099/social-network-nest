import { Injectable } from '@nestjs/common';
import { SessionDBModel, SessionViewModel } from './security.models';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './security.schema';
import { Model } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async createSession(
    activeSession: SessionDBModel,
  ): Promise<SessionViewModel> {
    const session = await this.sessionModel.create(activeSession);
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate.toISOString(),
      deviceId: session.deviceId,
    };
  }

  async updateLastActiveDate(deviceId: string, date: string) {
    return this.sessionModel.updateOne({ deviceId }, { lastActiveDate: date });
  }

  async getActiveSession(deviceId: string) {}
  async getAllActiveSessions(userId: string) {}

  async deleteCurrentSession(deviceId: string) {}
  async deleteOtherActiveSessions(deviceId: string) {}
}

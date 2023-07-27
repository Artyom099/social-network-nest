import { Injectable } from '@nestjs/common';
import { SessionDBModel, SessionViewModel } from './devices.models';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async getSession(deviceId: string): Promise<SessionViewModel | null> {
    const session = await this.sessionModel.findOne({ deviceId }).exec();
    if (!session) return null;
    else
      return {
        ip: session.ip,
        title: session.title,
        lastActiveDate: session.lastActiveDate.toISOString(),
        deviceId: session.deviceId,
      };
  }
  //todo - : Promise<SessionViewModel[]>
  async getSessions(userId: string) {
    return this.sessionModel
      .find({ userId }, { projection: { _id: 0, userId: 0 } })
      .exec();
  }

  async createSession(session: SessionDBModel): Promise<SessionViewModel> {
    await this.sessionModel.create(session);
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

  async deleteOtherSessions(deviceId: string) {
    return this.sessionModel.deleteMany({ $nor: [{ deviceId }] });
  }
  async deleteCurrentSession(deviceId: string) {
    return this.sessionModel.deleteOne({ deviceId });
  }
}

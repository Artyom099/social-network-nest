import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './devices.schema';
import { Model } from 'mongoose';
import { SessionViewModel } from './devices.models';

@Injectable()
export class DevicesQueryRepository {
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
}

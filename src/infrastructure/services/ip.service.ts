import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
} from '../../features/devices/devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class IpService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async countIpAndUrl(
    ip: string,
    url: string,
    date: Date,
  ): Promise<number | null> {
    return this.sessionModel.countDocuments({
      $and: [{ ip }, { url }, { date: { $gte: date } }],
    });
  }

  async addIpAndUrl(ip: string, url: string, date: Date) {
    await this.sessionModel.create({ ip, url, date });
  }
}

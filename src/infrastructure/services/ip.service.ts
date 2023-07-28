import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, RequestDocument } from './ip.schema';

@Injectable()
export class IpService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
  ) {}

  async countIpAndUrl(ip: string, url: string, date: Date): Promise<number> {
    return this.requestModel.countDocuments({
      $and: [{ ip }, { url }, { date: { $gte: date } }],
    });
  }

  async addIpAndUrl(ip: string, url: string, date: Date) {
    await this.requestModel.create({ ip, url, date });
  }
}

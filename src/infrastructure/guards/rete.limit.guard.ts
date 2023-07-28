import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { IpService } from '../services/ip.service';

@Injectable()
export class ReteLimitGuard implements CanActivate {
  constructor(private ipService: IpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const url = request.originalUrl;
    const dateNow = Date.now();
    const timeLimit = new Date(dateNow - 11_000);

    const countIP = await this.ipService.countIpAndUrl(ip, url, timeLimit);

    if (!countIP && countIP! >= 5) {
      throw new HttpException('TooManyRequest', HttpStatus.TOO_MANY_REQUESTS);
    } else {
      await this.ipService.addIpAndUrl(ip, url, new Date(dateNow));
      return true;
    }
  }
}

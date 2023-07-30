import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DevicesQueryRepository } from '../../features/devices/infrastructure/devices.query.repository';
import { jwtConstants } from '../utils/settings';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = CookieGuard.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      const tokenIssuedAt = new Date(payload.iat * 1000).toISOString();
      const lastActiveSession = await this.devicesQueryRepository.getSession(
        payload.deviceId,
      );
      if (
        !lastActiveSession ||
        tokenIssuedAt !== lastActiveSession.lastActiveDate
      ) {
        throw new UnauthorizedException();
      }

      request.userId = payload.userId;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private static extractTokenFromCookie(request: Request): string | null {
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    return null;
  }
}

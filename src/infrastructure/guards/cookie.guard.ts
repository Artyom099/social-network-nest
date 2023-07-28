import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../../features/auth/constants';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.secret,
      });
      request['userId'] = payload.userId;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromCookie(request: Request): string | null {
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    return null;
  }
}

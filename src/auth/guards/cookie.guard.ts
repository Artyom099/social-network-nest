import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException();

    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: jwtConstants.secret,
    });
    const userId = payload.userId;

    if (!userId) {
      throw new UnauthorizedException();
    } else {
      request['userId'] = userId;
      return true;
    }
  }

  private extractTokenFromCookie(request: Request): string | null {
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    return null;
  }
}

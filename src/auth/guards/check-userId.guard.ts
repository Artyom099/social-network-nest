import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

@Injectable()
export class CheckUserIdGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);

    if (!refreshToken) {
      request.body.userId = null;
    } else {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.secret,
      });
      request.body.userId = payload.userId;
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | null {
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    return null;
  }
}

import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

export class CookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromHeader(request);
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

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

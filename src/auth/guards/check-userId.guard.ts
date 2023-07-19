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
    console.log({ refreshToken: refreshToken });
    if (!refreshToken) {
      request['userId'] = null;
    } else {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.secret,
      });
      request['userId'] = payload.userId;
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | null {
    // if (request.cookies && request.cookies.refreshToken) {
    //   return request.cookies.refreshToken;
    // }
    // if (request.headers.authorization) {
    //   return request.headers.authorization;
    // } else {
    //   return null;
    // }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

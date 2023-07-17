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
    console.log({ refreshToken: refreshToken });
    console.log(jwtConstants.secret);
    //todo - Cannot read properties of undefined (reading 'verifyAsync')
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: jwtConstants.secret,
    });
    console.log({ payload: payload });
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
    // console.log({ type: type }, { token: token });
    return type === 'Bearer' ? token : null;
  }
}

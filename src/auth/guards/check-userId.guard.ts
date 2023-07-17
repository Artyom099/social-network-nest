import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

export class CheckUserIdGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromHeader(request);

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

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // console.log({ type: type }, { token: token });
    return type === 'Bearer' ? token : null;
  }
}

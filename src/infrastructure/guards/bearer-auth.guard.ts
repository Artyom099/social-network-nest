import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtConstants } from '../../features/auth/constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromHeader(request);
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      request.userId = payload.userId;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

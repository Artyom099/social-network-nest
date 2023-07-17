import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, authValue] = auth.split(' ');

    if (authType !== 'Basic' || authValue !== 'YWRtaW46cXdlcnR5') {
      throw new UnauthorizedException();
    } else {
      return true;
    }
  }
}

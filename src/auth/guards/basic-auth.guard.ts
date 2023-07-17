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
    console.log({ auth: auth });
    if (!auth) throw new UnauthorizedException();
    console.log('111');
    const [authType, authValue] = auth.split(' ');

    if (authType !== 'Basic' || authValue !== 'YWRtaW46cXdlcnR5') {
      console.log('222');
      throw new UnauthorizedException();
    } else {
      console.log('333');
      return true;
    }
  }
}

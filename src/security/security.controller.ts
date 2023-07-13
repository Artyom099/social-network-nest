import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { AuthService } from '../auth/auth.service';

@Controller('security')
export class SecurityController {
  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Req() req) {
    const tokenPayload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    // return this.securityService.getSessions(tokenPayload.userId);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherSessions(@Req() req) {
    const tokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (tokenPayload)
      await this.securityService.deleteOtherSessions(tokenPayload.deviceId);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentSession(@Req() req, @Param('id') deviceId: string) {
    const currentSession = await this.securityService.getSession(deviceId);
    if (!currentSession) {
      throw new NotFoundException();
    }
    const tokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (!tokenPayload) {
      throw new UnauthorizedException();
    }

    const activeSessions = await this.securityService.getSessions(
      tokenPayload.userId,
    );
    if (!activeSessions.find((s) => s.deviceId === currentSession.deviceId)) {
      throw new ForbiddenException();
    } else {
      await this.securityService.deleteCurrentSession(deviceId);
    }
  }
}

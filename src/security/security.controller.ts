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
  async getActiveSessions() {
    const userId = 'mock';
    return this.securityService.getSessions(userId);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherSessions() {
    const userId = 'mock';
    await this.securityService.deleteOtherSessions(userId);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentSession(@Req() req, @Param('id') deviceId: string) {
    const currentSession = await this.securityService.getSession(deviceId);
    if (!currentSession) {
      throw new NotFoundException();
    }
    const tokenPayload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
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

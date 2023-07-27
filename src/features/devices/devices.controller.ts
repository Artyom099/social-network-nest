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
import { DevicesService } from './devices.service';
import { AuthService } from '../auth/auth.service';
import { DevicesQueryRepository } from './devices.query.repository';

@Controller('security')
export class DevicesController {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Req() req) {
    const tokenPayload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    if (!tokenPayload) throw new Error();
    return this.devicesQueryRepository.getSessions(tokenPayload.userId);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherSessions(@Req() req) {
    const tokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (tokenPayload)
      await this.devicesService.deleteOtherSessions(tokenPayload.deviceId);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentSession(@Req() req, @Param('id') deviceId: string) {
    const currentSession = await this.devicesService.getSession(deviceId);
    if (!currentSession) {
      throw new NotFoundException();
    }
    const tokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (!tokenPayload) {
      throw new UnauthorizedException();
    }

    const activeSessions = await this.devicesService.getSessions(
      tokenPayload.userId,
    );
    if (!activeSessions.find((s) => s.deviceId === currentSession.deviceId)) {
      throw new ForbiddenException();
    } else {
      await this.devicesService.deleteCurrentSession(deviceId);
    }
  }
}

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
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from '../application/devices.service';
import { AuthService } from '../../auth/application/auth.service';
import { DevicesQueryRepository } from '../infrastructure/devices.query.repository';
import { CookieGuard } from '../../../infrastructure/guards/cookie.guard';

@Controller('security')
export class DevicesController {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get('devices')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Req() req) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    return this.devicesQueryRepository.getSessions(payload.userId);
  }

  @Delete('devices')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherSessions(@Req() req) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    if (payload)
      await this.devicesService.deleteOtherSessions(payload.deviceId);
  }

  @Delete('devices/:id')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentSession(@Req() req, @Param('id') deviceId: string) {
    const currentSession = await this.devicesQueryRepository.getSession(
      deviceId,
    );
    if (!currentSession) throw new NotFoundException();

    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    const activeSessions = await this.devicesQueryRepository.getSessions(
      payload.userId,
    );

    if (!activeSessions.find((s) => s.deviceId === currentSession.deviceId)) {
      throw new ForbiddenException();
    } else {
      await this.devicesService.deleteCurrentSession(deviceId);
    }
  }
}

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
import { Request } from 'express';

@Controller('security/devices')
export class DeviceController {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get()
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveDevices(@Req() req: Request) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    return this.devicesQueryRepository.getSessions(payload.userId);
  }

  @Delete()
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(@Req() req: Request) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (payload)
      await this.devicesService.deleteOtherSessions(payload.deviceId);
  }

  @Delete(':id')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentDevice(
    @Req() req: Request,
    @Param('id') deviceId: string,
  ) {
    const device = await this.devicesQueryRepository.getSession(deviceId);
    if (!device) throw new NotFoundException();

    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    const userDevices = await this.devicesQueryRepository.getSessions(
      payload.userId,
    );

    if (!userDevices.find((d) => d.deviceId === device.deviceId))
      throw new ForbiddenException();

    return this.devicesService.deleteCurrentSession(deviceId);
  }
}

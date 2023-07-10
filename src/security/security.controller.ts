import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getActiveSessions() {}

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllSessions() {}

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentSession() {}
}

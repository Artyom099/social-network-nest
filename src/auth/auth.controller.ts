import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthInputModel } from './auth.models';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyInfo() {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() InputModel: AuthInputModel) {}

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout() {}

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword() {}

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery() {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken() {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration() {}

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail() {}

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail() {}
}

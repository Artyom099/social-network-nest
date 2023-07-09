import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  //
  //
  //

  // @Get('me')
  // @HttpCode(HttpStatus.OK)
  // async getMyInfo() {}
  //
  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // async login(@Body() InputModel: AuthInputModel) {}
  //
  // @Post('logout')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async logout() {}
  //
  // @Post('new-password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async setNewPassword() {}
  //
  // @Post('password-recovery')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async passwordRecovery() {}
  //
  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken() {}
  //
  // @Post('registration')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async registration() {}
  //
  // @Post('registration-confirmation')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async sendConfirmationEmail() {}
  //
  // @Post('registration-email-resending')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async resendConfirmationEmail() {}
}

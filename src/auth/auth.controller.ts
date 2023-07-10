import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthInputModel } from './auth.models';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req) {
    return req.user;
  }

  //
  //

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Request() req) {
    return {
      email: req.user.email,
      login: req.user.login,
      userId: req.user.id,
    };
  }

  @Post('login2')
  @HttpCode(HttpStatus.OK)
  async login(@Body() InputModel: AuthInputModel) {
    const login = this.authService.checkCredentials(
      InputModel.loginOrEmail,
      InputModel.password,
    );
    if (!login) {
      throw new UnauthorizedException();
    } else {
      return login;
    }
  }

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

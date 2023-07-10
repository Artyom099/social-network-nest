import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthInputModel } from './auth.models';
import { BearerAuthGuard } from './guards/bearer-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Get('profile')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Request() req) {
    const user = await this.authService.getUser(req.userId);
    return {
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    };
  }

  @Post('login')
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

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() recoveryCode: string, newPassword: string) {
    const verifyRecoveryCode = await this.authService.checkRecoveryCode(
      recoveryCode,
    );
    if (!verifyRecoveryCode) {
      throw new BadRequestException();
    } else {
      await this.authService.updatePassword(recoveryCode, newPassword);
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() email: string) {
    return { recoveryCode: this.authService.sendRecoveryCode(email) };
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken() {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() email: string, login: string, password: string) {
    //todo - добавить имя поля в обоих Exception
    const existUserEmail = await this.authService.getUserByLoginOrEmail(email);
    if (existUserEmail) {
      throw new BadRequestException();
    }
    const existUserLogin = await this.authService.getUserByLoginOrEmail(login);
    if (existUserLogin) {
      throw new BadRequestException();
    } else {
      await this.authService.createUser(login, password, email);
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail(@Body() code: string) {
    const verifyEmail = await this.authService.checkConfirmationCode(code);
    if (!verifyEmail) {
      throw new BadRequestException();
    } else {
      return true;
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(@Body() email: string) {
    const existUser = await this.authService.getUserByLoginOrEmail(email);
    if (!existUser || existUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException();
    } else {
      await this.authService.updateConfirmationCode(email);
    }
  }
}

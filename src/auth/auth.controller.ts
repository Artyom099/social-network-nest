import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { SecurityService } from '../security/security.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CreateUserInputModel } from '../users/users.models';
import { AuthInputModel } from './auth.models';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Request() req) {
    const user = await this.usersQueryRepository.getUserById(req.userId);
    return {
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() InputModel: AuthInputModel,
  ) {
    const token = await this.authService.checkCredentials(
      InputModel.loginOrEmail,
      InputModel.password,
    );
    if (!token) {
      throw new UnauthorizedException();
    } else {
      const title = req.headers['user-agent'];
      const tokenPayload = this.authService.getTokenPayload(token.refreshToken);
      const lastActiveDate = new Date(tokenPayload!.iat * 1000);

      await this.securityService.createSession(
        req.ip,
        title,
        lastActiveDate,
        tokenPayload!.deviceId,
        tokenPayload!.userId,
      );
      res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: token.accessToken };
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    const refreshTokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    // await this.securityService.deleteCurrentSession(
    //   refreshTokenPayload.deviceId,
    // );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() recoveryCode: string, newPassword: string) {
    const confirm = await this.authService.checkRecoveryCode(recoveryCode);
    if (!confirm) {
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
  async registration(@Body() inputModel: CreateUserInputModel) {
    //todo - добавить имя поля в обоих Exception
    const existUserEmail = await this.authService.getUserByLoginOrEmail(
      inputModel.email,
    );
    if (existUserEmail) {
      throw new BadRequestException();
    }
    const existUserLogin = await this.authService.getUserByLoginOrEmail(
      inputModel.login,
    );
    if (existUserLogin) {
      throw new BadRequestException();
    } else {
      await this.authService.createUser(inputModel);
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail(@Body() code: string) {
    const confirmEmail = await this.authService.confirmEmail(code);
    if (!confirmEmail) {
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

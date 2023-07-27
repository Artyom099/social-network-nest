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
import { BearerAuthGuard } from '../../infrastructure/guards/bearer-auth.guard';
import { SecurityService } from '../devices/security.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CreateUserInputModel } from '../users/users.models';
import { AuthInputModel, EmailInputModel } from './auth.models';
import { CookieGuard } from '../../infrastructure/guards/cookie.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private securityService: SecurityService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Request() req) {
    console.log(req.userId);
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
      //'user-agent'  || 'device-1'
      const title = req.headers['host'];
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

  @Post('refresh-token')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const refreshTokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    const tokenIssuedAt = new Date(
      refreshTokenPayload!.iat * 1000,
    ).toISOString();
    const lastActiveSession = await this.securityService.getSession(
      refreshTokenPayload!.deviceId,
    );

    if (tokenIssuedAt !== lastActiveSession!.lastActiveDate) {
      throw new UnauthorizedException();
    } else {
      const token = await this.authService.updateJWT(
        refreshTokenPayload!.userId,
        refreshTokenPayload!.deviceId,
      );
      const newTokenPayload = this.authService.getTokenPayload(
        token.refreshToken,
      );
      const lastActiveDate = new Date(
        newTokenPayload!.iat * 1000,
      ).toISOString();
      await this.securityService.updateLastActiveDate(
        refreshTokenPayload!.deviceId,
        lastActiveDate,
      );

      res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: token.accessToken };
    }
  }

  @Post('logout')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    const refreshTokenPayload = this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    await this.securityService.deleteCurrentSession(
      refreshTokenPayload!.deviceId,
    );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(
    @Body() body: { recoveryCode: string; newPassword: string },
  ) {
    const confirm = await this.authService.checkRecoveryCode(body.recoveryCode);
    if (!confirm) {
      throw new BadRequestException();
    } else {
      await this.authService.updatePassword(
        body.recoveryCode,
        body.newPassword,
      );
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  //для моих тестов дожно быть OK
  async passwordRecovery(@Body() InputModel: EmailInputModel) {
    console.log({
      recoveryCode_1: await this.authService.sendRecoveryCode(InputModel.email),
    });
    return {
      recoveryCode: await this.authService.sendRecoveryCode(InputModel.email),
    };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: CreateUserInputModel) {
    const existUserEmail = await this.authService.getUserByLoginOrEmail(
      inputModel.email,
    );
    if (existUserEmail) {
      throw new BadRequestException('email exist=>email');
    }
    const existUserLogin = await this.authService.getUserByLoginOrEmail(
      inputModel.login,
    );
    if (existUserLogin) {
      throw new BadRequestException('login exist=>login');
    } else {
      await this.authService.createUser(inputModel);
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail(@Body() body: { code: string }) {
    const confirmEmail = await this.authService.confirmEmail(body.code);
    if (!confirmEmail) {
      throw new BadRequestException(
        'code is incorrect, expired or already applied=>code',
      );
    } else {
      return true;
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(@Body() body: { email: string }) {
    const existUser = await this.authService.getUserByLoginOrEmail(body.email);
    if (!existUser || existUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException('email not exist or confirm=>email');
    } else {
      return this.authService.updateConfirmationCode(body.email);
    }
  }
}

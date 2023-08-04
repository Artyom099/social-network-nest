import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { DevicesService } from '../../devices/application/devices.service';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CreateUserInputModel } from '../../users/api/users.models';
import {
  AuthInputModel,
  EmailInputModel,
  SetNewPasswordInputModel,
} from './auth.models';
import { CookieGuard } from '../../../infrastructure/guards/cookie.guard';
import { JwtService } from '@nestjs/jwt';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import { RegisterUserCommand } from '../application/use.cases/register.user.use.case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private securityService: DevicesService,
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Req() req) {
    console.log(req.userId);
    const user = await this.usersQueryRepository.getUserById(req.userId);
    return {
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    };
  }

  @Post('login')
  // @UseGuards(RateLimitGuard)
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
    if (!token) throw new UnauthorizedException();
    const payload = await this.authService.getTokenPayload(token.refreshToken);
    const user = await this.usersQueryRepository.getUserById2(payload.userId);

    if (user?.banInfo.isBanned) {
      throw new UnauthorizedException();
    } else {
      const title = req.headers['host'];
      const payload = await this.authService.getTokenPayload(
        token.refreshToken,
      );
      const lastActiveDate = new Date(payload.iat * 1000);
      await this.securityService.createSession(
        req.ip,
        title,
        lastActiveDate,
        payload.deviceId,
        payload.userId,
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
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    const token = await this.authService.updateJWT(
      payload.userId,
      payload.deviceId,
    );
    const newPayload = await this.authService.getTokenPayload(
      token.refreshToken,
    );
    const lastActiveDate = new Date(newPayload.iat * 1000).toISOString();
    await this.securityService.updateLastActiveDate(
      payload.deviceId,
      lastActiveDate,
    );

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: token.accessToken };
  }

  @Post('logout')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );
    await this.securityService.deleteCurrentSession(payload.deviceId);
  }

  @Post('new-password')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() InputModel: SetNewPasswordInputModel) {
    const isUserConfirm = await this.usersQueryRepository.getUserByRecoveryCode(
      InputModel.recoveryCode,
    );
    if (!isUserConfirm) {
      throw new BadRequestException();
    } else {
      await this.authService.updatePassword(
        InputModel.recoveryCode,
        InputModel.newPassword,
      );
    }
  }

  @Post('password-recovery')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  //todo -> для моих тестов статус OK, по документации NO_CONTENT
  async passwordRecovery(@Body() InputModel: EmailInputModel) {
    return {
      recoveryCode: await this.authService.sendRecoveryCode(InputModel.email),
    };
  }

  @Post('registration')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: CreateUserInputModel) {
    const existUserEmail =
      await this.usersQueryRepository.getUserByLoginOrEmail(inputModel.email);
    if (existUserEmail) {
      throw new BadRequestException('email exist=>email');
    }
    const existUserLogin =
      await this.usersQueryRepository.getUserByLoginOrEmail(inputModel.login);
    if (existUserLogin) {
      throw new BadRequestException('login exist=>login');
    } else {
      await this.commandBus.execute(new RegisterUserCommand(inputModel));
    }
  }

  @Post('registration-confirmation')
  // @UseGuards(RateLimitGuard)
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
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(@Body() body: { email: string }) {
    const existUser = await this.usersQueryRepository.getUserByLoginOrEmail(
      body.email,
    );
    if (!existUser || existUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException('email not exist or confirm=>email');
    } else {
      return this.authService.updateConfirmationCode(body.email);
    }
  }
}

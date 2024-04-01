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
import { CookieGuard } from '../../../infrastructure/guards/cookie.guard';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import { RegisterUserCommand } from '../application/use.cases/register.user.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../users/api/models/create.user.input.model';
import { ConfirmEmailCommand } from '../application/use.cases/confirm.email.use.case';
import { SendRecoveryCodeCommand } from '../application/use.cases/send.recovery.code.use.case';
import { UpdatePasswordCommand } from '../application/use.cases/update.password.use.case';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { AuthInputModel } from './models/auth.input.model';
import { EmailInputModel } from './models/email.input.model';
import { SetNewPasswordInputModel } from './models/set.new.password.input.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CreateDeviceModel } from '../../devices/api/models/create.device.model';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
    private securityService: DevicesService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Req() req: any) {
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
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
    @Body() body: AuthInputModel,
  ) {
    const { loginOrEmail, password } = body;

    const token = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );
    if (!token) throw new UnauthorizedException();

    const payload = await this.authService.getTokenPayload(token.refreshToken);
    const user = await this.usersRepository.getUserDocumentById(payload.userId);

    if (user?.banInfo.isBanned) throw new UnauthorizedException();

    const newPayload = await this.authService.getTokenPayload(
      token.refreshToken,
    );

    const dto: CreateDeviceModel = {
      ip: req.ip,
      title: req.headers['host'],
      lastActiveDate: new Date(newPayload.iat * 1000),
      deviceId: newPayload.deviceId,
      userId: newPayload.userId,
    };
    await this.securityService.createSession(dto);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: token.accessToken };
  }

  @Post('refresh-token')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) res: any) {
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
  async logout(@Req() req: any) {
    const payload = await this.authService.getTokenPayload(
      req.cookies.refreshToken,
    );

    return this.securityService.deleteCurrentSession(payload.deviceId);
  }

  @Post('new-password')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() body: SetNewPasswordInputModel) {
    const isUserConfirm =
      await this.usersRepository.getUserDocumentByRecoveryCode(
        body.recoveryCode,
      );
    if (!isUserConfirm) throw new BadRequestException();

    await this.commandBus.execute(
      new UpdatePasswordCommand(body.recoveryCode, body.newPassword),
    );
  }

  @Post('password-recovery')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  //todo -> для моих тестов статус OK, по документации NO_CONTENT
  async passwordRecovery(@Body() body: EmailInputModel) {
    return {
      recoveryCode: await this.commandBus.execute(
        new SendRecoveryCodeCommand(body.email),
      ),
    };
  }

  @Post('registration')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputModel) {
    const existUserEmail =
      await this.usersRepository.getUserDocumentByLoginOrEmail(body.email);
    if (existUserEmail) throw new BadRequestException('email exist=>email');

    const existUserLogin =
      await this.usersRepository.getUserDocumentByLoginOrEmail(body.login);
    if (existUserLogin) {
      throw new BadRequestException('login exist=>login');
    } else {
      return this.commandBus.execute(new RegisterUserCommand(body));
    }
  }

  @Post('registration-confirmation')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail(@Body() body: { code: string }) {
    const confirmEmail = await this.commandBus.execute(
      new ConfirmEmailCommand(body.code),
    );
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
  async resendConfirmationEmail(@Body() body: EmailInputModel) {
    const user = await this.usersRepository.getUserDocumentByLoginOrEmail(
      body.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      throw new BadRequestException('email not exist or confirm=>email');
    } else {
      return this.commandBus.execute(new ConfirmEmailCommand(body.email));
    }
  }
}

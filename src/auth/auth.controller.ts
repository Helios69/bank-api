import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './guards/localAuthentication.guard';
import { RequestWithUser } from './interfaces/requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @ApiResponse({ status: 200, description: 'Sign in using email and password' })
  @Post('/sign-in')
  signIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authService.getCookieWithJwtToken(user.id, user.email);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send(cookie);
  }

  @HttpCode(200)
  @Post('/sign-out')
  async signOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      `Authentication=; HttpOnly; Path=/; Max-Age=0`,
    );
    response.sendStatus(200);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from '../users/domain/user';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({
    schema: {
      properties: {
        token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @Public()
  @Throttle(5, 60)
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Req() request: Request & { user: { id: string | number } }) {
    return this.authService.me(request.user.id);
  }
}

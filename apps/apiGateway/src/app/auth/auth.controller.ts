import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSessionDto } from '../dto/sessions/createSession.dto';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RotateSessionDto } from '../dto/sessions/rotateSession.dto';
import { ClientDto } from '../dto/oauth/client.dto';
import { CreateClientDto } from '../dto/oauth/createClient.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ example: TokensDto })
  async register(@Body() body: CreateSessionDto): Promise<TokensDto> {
    return await this.authService.register(body);
  }

  @Post('login')
  @ApiResponse({ example: TokensDto })
  async login(@Body() body: CreateSessionDto): Promise<TokensDto> {
    return await this.authService.login(body);
  }

  @Post('rotate')
  @ApiResponse({ example: TokensDto, status: HttpStatus.OK })
  async rotate(@Body() body: RotateSessionDto): Promise<TokensDto> {
    return await this.authService.rotate(body);
  }

  @Patch('revoke/:sessionId')
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: 'sessionId', type: 'string', required: true })
  async revoke(@Param('sessionId') sessionId: string): Promise<void> {
    await this.authService.revoke(sessionId);
  }

  @Post('oauth/client')
  @ApiResponse({ example: ClientDto, status: HttpStatus.CREATED })
  async oauthCreateClient(@Body() body: CreateClientDto): Promise<ClientDto> {
    return await this.authService.oauthCreateClient(body);
  }

  @Get('oauth')
  @ApiQuery({ name: 'client_id', type: 'string', required: true })
  @ApiQuery({ name: 'redirect_uri', type: 'string', required: true })
  async oauthGenUrl(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
  ): Promise<URL> {
    return await this.authService.oauthGenUrl(clientId, redirectUri);
  }

  @Get('oauth/callback')
  @ApiQuery({ name: 'code', type: 'string', required: true })
  @ApiQuery({ name: 'state', type: 'string', required: true })
  async oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<URL> {
    return await this.authService.oauthCallback(code, state);
  }
}

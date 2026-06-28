import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OauthRepository } from '../repositories/oauth.repository';
import { Repository } from 'typeorm';
import { TokensDto } from '../dto/sessions/tokens.dto';

@Injectable()
export class OauthCommands {
  constructor(private readonly oauthRepository: Repository<OauthRepository>) {}

  async handleOauth(
    oauthClientId: string,
  ): Promise<TokensDto> {
    const oauthClient: OauthRepository | null = await this.oauthRepository.findOneBy({
      clientId: oauthClientId,
    });
    if (!oauthClient) {
      throw new UnauthorizedException("Invalid credentials");
    }

  }
}

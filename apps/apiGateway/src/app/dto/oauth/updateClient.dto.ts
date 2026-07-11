import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  redirectUris?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  grantTypes?: string[];
}

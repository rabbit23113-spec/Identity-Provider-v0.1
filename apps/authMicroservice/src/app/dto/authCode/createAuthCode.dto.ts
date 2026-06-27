export class CreateAuthCodeDto {
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  expiresAt: Date;
}

export class UpdateClientDto {
  clientId: string;
  name?: string;
  redirectUris?: string[];
  grantTypes?: string[];
}

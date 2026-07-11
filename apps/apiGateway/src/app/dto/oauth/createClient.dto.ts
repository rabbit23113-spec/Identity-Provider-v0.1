export class CreateClientDto {
  clientSecretHash: string;
  name: string;
  redirectUris: string[];
  grantTypes: string[];
}

export class ClientDto {
  clientId: string;
  clientSecretHash: string;
  name: string;
  redirectUris: string[];
  grantTypes: string[];
  createdAt: Date;
}

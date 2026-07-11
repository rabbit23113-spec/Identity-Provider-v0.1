/*

  ?client_id=abc123
&redirect_uri=https://app.example.com/callback
&response_type=code
&scope=openid profile
&state=xyz

   */

export class HandleOauthDto {
  clientId: string;

}

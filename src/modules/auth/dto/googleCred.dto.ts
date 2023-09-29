// google-signin.dto.ts

import { IsString } from 'class-validator';

export class GoogleSignInDto {
  @IsString()
  credential: string;

  @IsString()
  clientId: string;
}

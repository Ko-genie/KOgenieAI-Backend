import { IsNotEmpty, IsString } from "class-validator";

export class UpdateTermsPrivacyDto {
  @IsNotEmpty()
  @IsString()
  privacy_policy: string;

  @IsNotEmpty()
  @IsString()
  terms_condition: string;
}
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLandingPageDataDto {
  @IsNotEmpty()
  @IsString()
  landing_page_first_title: string;

  @IsNotEmpty()
  @IsString()
  landing_page_first_description: string;

  @IsNotEmpty()
  @IsString()
  landing_page_first_btn_text: string;

  @IsNotEmpty()
  @IsString()
  landing_page_trusted_org_text: string;

  @IsNotEmpty()
  @IsString()
  landing_page_client_title_text: string;
}

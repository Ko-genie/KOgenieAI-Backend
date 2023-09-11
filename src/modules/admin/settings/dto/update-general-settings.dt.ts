import { AdminSettings } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { coreConstant } from 'src/shared/helpers/coreConstant';

export class UpdateGeneralSettingsDto {
  @IsNotEmpty()
  @IsString()
  site_name: string;

  @IsNotEmpty()
  @IsString()
  site_url: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  site_email: string;

  @IsNotEmpty()
  @IsString()
  default_country: string;

  @IsNotEmpty()
  @IsString()
  default_currency: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsIn([coreConstant.STATUS_ACTIVE, coreConstant.STATUS_INACTIVE])
  registration_status: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  free_usage_word_upon_registration: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  free_usage_image_upon_registration: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsIn([coreConstant.STATUS_ACTIVE, coreConstant.STATUS_INACTIVE])
  social_login_facebook_status: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsIn([coreConstant.STATUS_ACTIVE, coreConstant.STATUS_INACTIVE])
  social_login_google_status: number;

  @IsNotEmpty()
  @IsString()
  google_analytics_tracking_id: string;

  @IsNotEmpty()
  @IsString()
  meta_title: string;

  @IsNotEmpty()
  @IsString()
  meta_description: string;

  @IsNotEmpty()
  @IsString()
  meta_keywords: string;

  @Type(() => Number)
  @IsNumber()
  site_logo: number;

  @Type(() => Number)
  @IsNumber()
  site_fav_icon: number;
}

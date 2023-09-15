import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Validate,
  IsJSON,
} from 'class-validator';
import { IsIn } from 'class-validator';
import { coreConstant } from 'src/shared/helpers/coreConstant';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    coreConstant.PACKAGE_DURATION.MONTHLY,
    coreConstant.PACKAGE_DURATION.WEEKLY,
    coreConstant.PACKAGE_DURATION.YEARLY,
  ])
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  type: number;

  @IsNumber()
  @IsNotEmpty()
  total_words: number;

  @IsNumber()
  @IsNotEmpty()
  total_images: number;

  @IsInt()
  @IsNotEmpty()
  status: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsNumber()
  @IsNotEmpty()
  total_purchase: number;

  @IsNumber()
  @IsNotEmpty()
  total_tokens_limit: number;

  @IsString()
  @IsNotEmpty()
  available_features: string;

  @IsString()
  feature_description_lists: string;
}

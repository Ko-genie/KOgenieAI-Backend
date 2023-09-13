import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Validate,
} from 'class-validator';
import { IsIn } from 'class-validator';
import { coreConstant } from 'src/shared/helpers/coreConstant';

export class UpdatePaymentDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([
    coreConstant.PACKAGE_DURATION.MONTHLY,
    coreConstant.PACKAGE_DURATION.WEEKLY,
    coreConstant.PACKAGE_DURATION.YEARLY,
  ])
  duration?: number;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsNumber()
  total_words?: number;

  @IsOptional()
  @IsNumber()
  total_images?: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsNumber()
  total_purchase?: number;

  @IsOptional()
  @IsNumber()
  total_tokens_limit?: number;
}

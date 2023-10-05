import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  ReviewArray,
  StatusOnOffArray,
} from 'src/shared/constants/array.constants';

export class CreateNewReviewDto {
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(ReviewArray)
  rating: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;

  @IsNumber()
  file_id: number;
}

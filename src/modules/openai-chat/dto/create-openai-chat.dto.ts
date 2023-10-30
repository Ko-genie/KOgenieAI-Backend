import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class CreateOpenAiChatDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  human_name: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;

  @IsOptional()
  @IsNumber()
  file_id: number;
}

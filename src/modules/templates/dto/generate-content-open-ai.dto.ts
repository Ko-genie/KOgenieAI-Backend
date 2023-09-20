import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import {
  CreativityKeyArray,
  OpenAiToneOfVoiceKeyArray,
} from 'src/shared/constants/array.constants';

export class GenerateOpenAiContentDto {
  @IsNotEmpty()
  @IsNumber()
  template_id: number;

  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(10)
  maximum_length: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  number_of_result: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(CreativityKeyArray)
  creativity: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(OpenAiToneOfVoiceKeyArray)
  tone_of_voice: string;

}

import { Type } from 'class-transformer';
import { IS_IN, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OpenAiToneOfVoiceKeyArray } from 'src/shared/constants/array.constants';


export class UpdateOpenAISettingsDto {
  @IsNotEmpty()
  @IsString()
  open_ai_secret: string;

  @IsNotEmpty()
  @IsNumber()
  open_ai_model: number;

  @IsNotEmpty()
  @IsNumber()
  open_ai_default_language: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(OpenAiToneOfVoiceKeyArray)
  open_ai_default_tone_of_voice: string;

  @IsNotEmpty()
  @IsNumber()
  open_ai_default_creativity: number;

  @IsNotEmpty()
  @IsNumber()
  open_ai_default_stream_server: number;

  @IsNotEmpty()
  @IsNumber()
  open_ai_max_input_length: number;

  @IsNotEmpty()
  @IsNumber()
  open_ai_max_output_length: number;
}

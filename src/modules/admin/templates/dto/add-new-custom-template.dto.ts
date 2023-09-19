import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { InputFieldTypeArray, PackageTypeArray } from 'src/shared/constants/array.constants';

export class InputGroupDto {
  @IsNotEmpty()
  @IsNumber()
  @IsIn(InputFieldTypeArray)
  type: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class AddNewCustomTemplateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(PackageTypeArray)
  package_type: number;

  @IsNotEmpty()
  @IsString()
  prompt_input: string;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InputGroupDto)
  input_groups: InputGroupDto[];
}

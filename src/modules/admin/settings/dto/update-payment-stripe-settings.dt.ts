import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModeStatusArray } from 'src/shared/constants/array.constants';

export class UpdatePaymentMethodStripeSettingsDto {
  @IsNotEmpty()
  @IsNumber()
  @IsIn(ModeStatusArray)
  pm_stripe_status_mode: number;

  @IsOptional()
  @IsString()
  pm_stripe_default_currency: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_client_id_sandbox: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_secret_key_sandbox: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_client_id_live: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_secret_key_live: string;
}

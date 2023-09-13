import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePaymentMethodStripeSettingsDto {
  @IsNotEmpty()
  @IsString()
  pm_stripe_public_key: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_secret_key: string;
}
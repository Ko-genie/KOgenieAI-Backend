import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBraintreeSettingsData {
  @IsNotEmpty()
  @IsString()
  braintree_merchant_id: string;

  @IsNotEmpty()
  @IsString()
  braintree_public_key: string;

  @IsNotEmpty()
  @IsString()
  braintree_private_key: string;
}

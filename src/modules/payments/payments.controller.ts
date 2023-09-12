import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Public()
  @Get('get-all-packages')
  getAllPackages(): Promise<ResponseModel> {
    return this.paymentsService.getAllSubcriptionPackages();
  }

  @IsAdmin()
  @Post('create-package')
  createPackage(@Body() packageInfo: CreatePaymentDto): Promise<ResponseModel> {
    return this.paymentsService.createPackageService(packageInfo);
  }
  @IsAdmin()
  @Post('update-package')
  updatePackage(@Body() updatedPackageInfo: UpdatePaymentDto): Promise<ResponseModel> {
    return this.paymentsService.updatePackageService(updatedPackageInfo);
  }
}

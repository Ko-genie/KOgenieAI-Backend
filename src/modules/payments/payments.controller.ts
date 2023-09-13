import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { Public } from 'src/shared/decorators/public.decorator';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Public()
  @Get('get-all-packages')
  getAllPackages(@Query('type') type: string): Promise<ResponseModel> {
    return this.paymentsService.getAllSubcriptionPackages(type);
  }
  @Get('check-subscription-status')
  checkSubscriptionStatus(@UserInfo() user: User): Promise<ResponseModel> {
    return this.paymentsService.checkSubscriptionStatus(user);
  }

  @IsAdmin()
  @Post('create-package')
  createPackage(@Body() packageInfo: CreatePaymentDto): Promise<ResponseModel> {
    return this.paymentsService.createPackageService(packageInfo);
  }
  @IsAdmin()
  @Post('update-package')
  updatePackage(
    @Body() updatedPackageInfo: UpdatePaymentDto,
  ): Promise<ResponseModel> {
    return this.paymentsService.updatePackageService(updatedPackageInfo);
  }

  @Post('subscribe')
  subscribeToPackage(
    @UserInfo() user: User,
    @Body()
    payload: {
      subcription_package_Id: string;
    },
  ): Promise<ResponseModel> {
    return this.paymentsService.subscribeToSubcriptionPackage(
      user,
      payload.subcription_package_Id,
    );
  }
  @Post('add-package-to-subscription')
  addPackageToSubscription(
    @UserInfo() user: User,
    @Body()
    payload: {
      packageId: string;
    },
  ): Promise<ResponseModel> {
    return this.paymentsService.addPackageToSubscription(
      user,
      payload.packageId,
    );
  }
}

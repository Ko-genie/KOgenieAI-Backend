import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
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
import { createIntentDto } from './dto/create-intent.dto';
import { paginateType } from './dto/query.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Public()
  @Get('get-all-packages')
  getAllPackages(
    @Query()
    payload: paginateType,
  ): Promise<ResponseModel> {
    return this.paymentsService.getAllSubcriptionPackages(payload);
  }
  @IsAdmin()
  @Get('admin-get-all-packages')
  getAllPackagesAdmin(
    @Query()
    payload: paginateType,
  ): Promise<ResponseModel> {
    return this.paymentsService.getAllPackagesAdmin(payload);
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
  @Delete('delete-package/:id')
  deletePackage(@Param('id') id: string): Promise<ResponseModel> {
    return this.paymentsService.deletePackage(id);
  }
  @IsAdmin()
  @Post('update-package')
  updatePackage(
    @Body() updatedPackageInfo: UpdatePaymentDto,
  ): Promise<ResponseModel> {
    return this.paymentsService.updatePackageService(updatedPackageInfo);
  }

  @Post('create-stripe-intent')
  createStripePaymentIntent(
    @Body() payload: createIntentDto,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.paymentsService.createStripePaymentIntent(payload.amount, user);
  }
  @Post('confirm-and-verify-stripe-payment')
  verifyPaymentIntent(
    @Body()
    payload: {
      payment_intent_id: string;
      subcription_package_Id: string;
    },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.paymentsService.verifyPaymentIntent(
      payload.payment_intent_id,
      payload.subcription_package_Id,
      user,
    );
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

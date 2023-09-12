import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Package, UserPurchasedPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import {
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPackageService(
    packageInfo: CreatePaymentDto,
  ): Promise<ResponseModel> {
    try {
      const CreatedPackage = await this.prisma.package.create({
        data: {
          name: packageInfo.name,
          description: packageInfo.description,
          price: packageInfo.price,
          duration: packageInfo.duration,
          type: packageInfo.type,
          total_words: packageInfo.total_words,
          total_images: packageInfo.total_images,
          status: packageInfo.status,
          image_url: packageInfo.image_url,
          total_tokens_limit: packageInfo.total_tokens_limit,
        },
      });

      if (!CreatedPackage) {
        return errorResponse("Package can't be created");
      }

      // Convert BigInt fields to strings for serialization
      const packageData = {
        ...CreatedPackage,
        total_words: CreatedPackage.total_words.toString(),
        total_images: CreatedPackage.total_images.toString(),
        total_purchase: CreatedPackage.total_purchase.toString(),
        total_tokens_limit: CreatedPackage.total_tokens_limit.toString(),
      };

      return successResponse('Package created successfully', packageData);
    } catch (error) {
      processException(error);
    }
  }

  async createUserPurchasePackage(
    userPurchasePackageInfo: UserPurchasedPackage,
    package_id: number,
    payment_method_id: number,
  ): Promise<UserPurchasedPackage> {
    return await this.prisma.userPurchasedPackage.create({
      data: {
        start_date: userPurchasePackageInfo.start_date,
        end_date: userPurchasePackageInfo.end_date,
        status:
          userPurchasePackageInfo.status == coreConstant.ACTIVE
            ? coreConstant.ACTIVE
            : coreConstant.INACTIVE,
        word_tokens: userPurchasePackageInfo.word_tokens,
        image_tokens: userPurchasePackageInfo.image_tokens,
        used_word_tokens: userPurchasePackageInfo.used_word_tokens,
        used_image_tokens: userPurchasePackageInfo.used_image_tokens,
        user_id: userPurchasePackageInfo.user_id,
        package_id: package_id,
        payment_method_id: payment_method_id,
      },
    });
  }
}

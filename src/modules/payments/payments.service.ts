import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Package, User, UserPurchasedPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import {
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { IsNotEmpty } from 'class-validator';

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
          duration:
            packageInfo.duration === coreConstant.PACKAGE_DURATION.MONTHLY
              ? coreConstant.PACKAGE_DURATION.MONTHLY
              : packageInfo.duration === coreConstant.PACKAGE_DURATION.YEARLY
              ? coreConstant.PACKAGE_DURATION.YEARLY
              : coreConstant.PACKAGE_DURATION.WEEKLY,
          type:
            packageInfo.type === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
              ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
              : coreConstant.PACKAGE_TYPES.PACKAGE,
          total_words: packageInfo.total_words,
          total_images: packageInfo.total_images,
          status:
            packageInfo.status === coreConstant.ACTIVE
              ? coreConstant.ACTIVE
              : coreConstant.INACTIVE,
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
  async updatePackageService(
    packageInfo: UpdatePaymentDto,
  ): Promise<ResponseModel> {
    try {
      const packageData = await this.prisma.package.update({
        where: {
          id: packageInfo.id,
        },
        data: {
          ...packageInfo,
        },
      });
      if (!packageData) {
        return errorResponse("Package can't be updated");
      }
      return successResponse('Package updated successfully', packageData);
    } catch (error) {
      processException(error);
    }
  }
  async getAllSubcriptionPackages(type: string): Promise<ResponseModel> {
    try {
      const queryType =
        Number(type) === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          : coreConstant.PACKAGE_TYPES.PACKAGE;

      const packages: Package[] = await this.prisma.package.findMany({
        where: {
          type: queryType,
        },
      });

      if (!packages) return errorResponse('Packages not found');
      return successResponse('Packages fetched successfully', packages);
    } catch (error) {
      processException(error);
    }
  }

  async subscribeToPackage(
    user: User,
    package_id: string,
  ): Promise<ResponseModel> {
    try {
      if (!package_id) {
        return errorResponse('No package id provided');
      }
      const { isValid } = await this.getUserPackage(user);
      if (isValid) {
        return errorResponse('User already subscribed to a package');
      }
      const packageData: Package = await this.prisma.package.findUnique({
        where: {
          id: Number(package_id),
        },
      });
      if (!packageData) {
        return errorResponse("Package can't be found");
      }
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const start_date = new Date(),
        end_date = new Date(
          start_date.setDate(start_date.getDate() + duration),
        );

      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          total_tokens_limit: packageData.total_tokens_limit,
        },
      });
      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      return successResponse('Package purchased successfully', purchedPackage);
    } catch (error) {
      processException(error);
    }
  }
  async getUserPackage(
    user: User,
  ): Promise<{ package: UserPurchasedPackage | null; isValid: boolean }> {
    const userPackage = await this.prisma.userPurchasedPackage.findFirst({
      where: {
        user_id: user.id,
        status: coreConstant.ACTIVE,
      },
      orderBy: {
        end_date: 'desc', // Use "desc" for descending order
      },
      include: {
        package: true,
      },
    });

    if (!userPackage) {
      return { package: null, isValid: false };
    }

    const currentDate = new Date();
    const endDate = new Date(userPackage.end_date);
    const isValid = currentDate <= endDate;

    return { package: userPackage, isValid };
  }

  async checkSubscriptionStatus(user: User): Promise<ResponseModel> {
    try {
      const { isValid, package: myPackage } = await this.getUserPackage(user);
      if (!isValid) {
        return errorResponse('Package expired please purchase again');
      }
      return successResponse('Subcribstion is valid', myPackage);
    } catch (error) {
      processException(error);
    }
  }
}

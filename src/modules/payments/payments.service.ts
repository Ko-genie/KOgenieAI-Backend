import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Package, User, UserPurchasedPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import {
  calculatePrice,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { StripeService } from './stripe/stripe.service';
import { paginateType } from './dto/query.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}
  stripe = new StripeService();

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
          available_features: packageInfo.available_features,
          feature_description_lists: packageInfo.feature_description_lists,
          model: packageInfo.model_name,
        },
      });

      if (!CreatedPackage) {
        return errorResponse("Package can't be created");
      }

      const packageData = {
        ...CreatedPackage,
        total_words: CreatedPackage.total_words.toString(),
        total_images: CreatedPackage.total_images.toString(),
        total_purchase: CreatedPackage.total_purchase.toString(),
      };

      return successResponse('Package created successfully', packageData);
    } catch (error) {
      processException(error);
    }
  }

  async deletePackage(id: string): Promise<ResponseModel> {
    try {
      const findPackage = await this.prisma.package.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!findPackage) {
        return errorResponse('Package not found');
      }

      const userPurchase = await this.prisma.userPurchasedPackage.findFirst({
        where: {
          package_id: Number(id),
          status: coreConstant.ACTIVE,
        },
      });
      if (userPurchase) {
        const softDeletePackage = await this.prisma.package.update({
          where: {
            id: Number(id),
          },
          data: {
            soft_delete: true,
          },
        });
        if (!softDeletePackage) {
          return errorResponse('Failed to delete package');
        }
        return successResponse('Package deleted successfully');
      }

      const packageData = await this.prisma.package.delete({
        where: {
          id: Number(id),
        },
      });
      if (!packageData) {
        return errorResponse('Package not found');
      }
      return successResponse('Package deleted successfully');
    } catch (error) {
      processException(error);
    }
  }
  async getPackageDetails(id: string): Promise<ResponseModel> {
    try {
      const packageData = await this.prisma.package.findFirst({
        where: {
          id: Number(id),
          soft_delete: false,
        },
      });
      if (!packageData) {
        return errorResponse('Package not found');
      }
      return successResponse('Package details', packageData);
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

  async createStripePaymentIntent(
    amount: number,
    user: User,
  ): Promise<ResponseModel> {
    try {
      const { package_valid } = await this.getUserPackage(user);
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }

      await this.stripe.init();
      const intent = await this.stripe.createStripePaymentIntent(amount, 'USD');
      if (!intent) {
        return errorResponse('Stripe payment intent can not be created');
      }
      return successResponse('Stripe payment intent created successfully', {
        intent: intent,
      });
    } catch (error) {
      processException(error);
    }
  }
  async verifyPaymentIntent(
    paymentIntentId: string,
    subcription_package_Id: string,
    user: User,
  ): Promise<ResponseModel> {
    try {
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }

      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          soft_delete: false,
          status: coreConstant.ACTIVE,
        },
      });

      if (!packageData) {
        return errorResponse("Package can't be found");
      }

      await this.stripe.init();

      // Verify the payment intent with Stripe
      const intent = await this.stripe.verifyPaymentIntent(paymentIntentId);
      if (!intent || intent.status !== 'succeeded') {
        return errorResponse(
          'Stripe payment intent could not be verified or has not succeeded',
        );
      }

      // Calculate the end_date based on the start_date and duration
      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);

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
          available_features: packageData.available_features,
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
  async getAllPackagesAdmin(payload: paginateType): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(payload);

      const queryType =
        Number(payload.type) === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          : coreConstant.PACKAGE_TYPES.PACKAGE;

      let packages: Package[];
      if (payload.type) {
        packages = await this.prisma.package.findMany({
          where: {
            type: queryType,
            soft_delete: false,
          },
          ...paginate,
        });
      } else {
        packages = await this.prisma.package.findMany({
          where: {
            type: queryType,
            soft_delete: false,
          },
          ...paginate,
        });
      }
      const paginationMeta = await paginationMetaData('package', payload);

      if (!packages) return errorResponse('Packages not found');
      return successResponse('Packages fetched successfully', {
        packages,
        meta: paginationMeta,
      });
    } catch (error) {
      processException(error);
    }
  }
  async getAllSubcriptionPackages(
    payload: paginateType,
  ): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(payload);

      const queryType =
        Number(payload.type) === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          : coreConstant.PACKAGE_TYPES.PACKAGE;

      let packages: Package[];
      if (payload.type) {
        packages = await this.prisma.package.findMany({
          where: {
            type: queryType,
            status: coreConstant.ACTIVE,
            soft_delete: false,
          },
          ...paginate,
        });
      } else {
        packages = await this.prisma.package.findMany({
          where: {
            type: queryType,
            status: coreConstant.ACTIVE,
            soft_delete: false,
          },
          ...paginate,
        });
      }
      const paginationMeta = await paginationMetaData('package', payload);

      if (!packages) return errorResponse('Packages not found');
      return successResponse('Packages fetched successfully', {
        packages,
        meta: paginationMeta,
      });
    } catch (error) {
      processException(error);
    }
  }

  async subscribeToSubcriptionPackage(
    user: User,
    subcription_package_Id: string,
  ): Promise<ResponseModel> {
    try {
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }

      const { package_valid } = await this.getUserPackage(user);
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }

      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          status: coreConstant.ACTIVE,
          soft_delete: false,
        },
      });

      if (!packageData) {
        return errorResponse("Package can't be found");
      }

      // Calculate the end_date based on the start_date and duration
      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);

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
          available_features: packageData.available_features,
          model: packageData.model,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      const total_purchase = Number(packageData.total_purchase) + 1;
      await this.prisma.package.update({
        where: {
          id: packageData.id,
        },
        data: {
          total_purchase: total_purchase,
        },
      });

      return successResponse('Package purchased successfully', purchedPackage);
    } catch (error) {
      processException(error);
    }
  }
  async addPackageToSubscription(
    user: User,
    packageId: string,
  ): Promise<ResponseModel> {
    try {
      if (!packageId) {
        return errorResponse('Invalid data please provide packageId');
      }
      const { package_valid, package: SubcribedPackage } =
        await this.getUserPackage(user);
      if (!package_valid) {
        return errorResponse(
          'Package is not valid or expired! Please buy a new package',
        );
      }
      const getPackageToAdd = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          type: coreConstant.PACKAGE_TYPES.PACKAGE,
        },
      });
      if (!getPackageToAdd) {
        return errorResponse('Package not found!');
      }
      const userUpdatedPackage = await this.prisma.userPurchasedPackage.update({
        where: {
          id: Number(SubcribedPackage.id),
        },
        data: {
          total_words:
            Number(SubcribedPackage.total_words) +
            Number(getPackageToAdd.total_words),
          total_images:
            Number(SubcribedPackage.total_images) +
            Number(getPackageToAdd.total_images),
        },
      });
      if (!userUpdatedPackage) {
        return errorResponse('Purchase failed!');
      }
      return successResponse('Purchased successfully!', userUpdatedPackage);
    } catch (error) {
      processException(error);
    }
  }

  async getUserPackage(user: User): Promise<{
    package: UserPurchasedPackage | null;
    package_valid: boolean;
    word_limit_exceed: boolean;
    image_limit_exceed: boolean;
  }> {
    let userPackage = await this.prisma.userPurchasedPackage.findFirst({
      where: {
        user_id: user.id,
        status: coreConstant.ACTIVE,
      },
      orderBy: {
        end_date: 'desc',
      },
    });
    const packageRef = userPackage;
    if (!userPackage) {
      return {
        package: null,
        package_valid: false,
        image_limit_exceed: true,
        word_limit_exceed: true,
      };
    }

    const image_limit_exceed =
      userPackage.used_images >= userPackage.total_images ? true : false;
    const word_limit_exceed =
      userPackage.used_words >= userPackage.total_words ? true : false;

    const currentDate = new Date();
    const endDate = new Date(userPackage.end_date);
    if (currentDate > endDate) {
      userPackage = await this.changeUserPackageStatus(
        packageRef.id,
        coreConstant.INACTIVE,
      );
    } else if (image_limit_exceed && word_limit_exceed) {
      userPackage = await this.changeUserPackageStatus(
        packageRef.id,
        coreConstant.INACTIVE,
      );
    }
    const package_valid =
      userPackage.status === coreConstant.ACTIVE ? true : false;

    return {
      package: userPackage,
      package_valid,
      image_limit_exceed,
      word_limit_exceed,
    };
  }

  async suggestPricing(
    model_name: string,
    images: number,
    words: number,
  ): Promise<ResponseModel> {
    try {
      if (!model_name) {
        return errorResponse('Please provide all the required fields');
      }
      const totalPrice = Math.ceil(calculatePrice(model_name, words, images));
      return successResponse(`Your cost will be around $${totalPrice}`, {
        price: totalPrice,
      });
    } catch (error) {}
  }

  async checkSubscriptionStatus(user: User): Promise<ResponseModel> {
    try {
      const {
        package_valid,
        package: myPackage,
        image_limit_exceed,
        word_limit_exceed,
      }: any = await this.getUserPackage(user);
      if (!myPackage) {
        return errorResponse('Not Subscribed to any package"');
      }
      const available_features = myPackage.available_features
        .split(',')
        .map(Number);
      const response = {
        ...myPackage,
        package_valid,
        image_limit_exceed,
        word_limit_exceed,
        available_features,
      };
      if (!package_valid) {
        return errorResponse('Package expired please purchase again');
      }
      return successResponse('Subcribstion is valid', response);
    } catch (error) {
      processException(error);
    }
  }
  changeUserPackageStatus(id: number, status: number) {
    return this.prisma.userPurchasedPackage.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  }
  async updateUserUsedWords(userPurchasedPackageid: number, words: number) {
    const getUserPurchasedPackage: any =
      await this.prisma.userPurchasedPackage.findUnique({
        where: {
          id: userPurchasedPackageid,
        },
      });
    const updatedUsedWords =
      Number(getUserPurchasedPackage.used_words) + Number(words);

    return this.prisma.userPurchasedPackage.update({
      where: {
        id: userPurchasedPackageid,
      },
      data: {
        used_words: updatedUsedWords,
      },
    });
  }
  async updateUserUsedImages(userPurchasedPackageid: number, images: number) {
    const getUserPurchasedPackage: any =
      await this.prisma.userPurchasedPackage.findUnique({
        where: {
          id: userPurchasedPackageid,
        },
      });
    const updatedUsedImages =
      Number(getUserPurchasedPackage.used_images) + images;
    return this.prisma.userPurchasedPackage.update({
      where: {
        id: userPurchasedPackageid,
      },
      data: {
        used_images: updatedUsedImages,
      },
    });
  }
}

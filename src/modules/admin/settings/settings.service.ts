import {
  adminSettingsValueBySlug,
  errorResponse,
  fetchMyUploadFilePathById,
  getAdminSettingsData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';
import { NotificationService } from 'src/shared/notification/notification.service';
import { User } from '@prisma/client';
import { SendTestMail } from 'src/notifications/user/test-mail';
import {
  CommonSettingsSlugs,
  GeneralSettingsSlugs,
  GoogleAuthCredentialsSlugs,
  OpenAISettingSlugs,
  OpenAISettingWithoutSecretSlugs,
  PaymentMethodStripeSettingsSlugs,
  SMTPSettingsSlugs,
  TermsConditionSlugs,
} from 'src/shared/constants/array.constants';
import { UpdateTermsPrivacyDto } from './dto/update-terms-privacy.dt';
import { UpdateOpenAISettingsDto } from './dto/update-open-ai-settings.dt';
import { async } from 'rxjs';
import { UpdatePaymentMethodStripeSettingsDto } from './dto/update-payment-stripe-settings.dt';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateGoogleAuthSettingsDto } from './dto/update-google-auth-settings.dt';

@Injectable()
export class SettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAllSettings() {
    try {
      const settings = await this.prisma.adminSettings.findMany();

      return settings;
    } catch (error) {
      processException(error);
    }
  }
  // update or create data
  async updateOrCreate(slugKey: any, values: any) {
    try {
      const checkData = await this.prisma.adminSettings.findFirst({
        where: {
          slug: slugKey,
        },
      });
      const payload = {
        value: String(values),
      };

      await this.prisma.adminSettings.upsert({
        where: { slug: slugKey },
        create: {
          // Data to insert if no matching record is found
          slug: slugKey, // Assuming slug is a required field
          value: payload.value, // Assuming payload contains the 'value' field
        },
        update: {
          // Data to update if a matching record is found
          value: payload.value, // Assuming payload contains the 'value' field
        },
      });
    } catch (error) {
      processException(error);
    }
  }
  async commonSettings() {
    try {
      const settings = await getAdminSettingsData(CommonSettingsSlugs);

      return successResponse('Common settings', settings);
    } catch (error) {
      processException(error);
    }
  }
  async getAdminDashboardData() {
    try {
      const data = {};
      data['totalUsers'] = await this.prisma.user.count();
      const totalSaleResult = await this.prisma.paymentTransaction.aggregate({
        _sum: {
          price: true,
        },
      });
      data['totalSale'] = totalSaleResult._sum.price.toNumber();

      const totalWordGenerated =
        await this.prisma.userPurchasedPackage.aggregate({
          _sum: {
            used_words: true,
            used_images: true,
          },
        });
      data['totalWordGenerated'] = totalWordGenerated._sum.used_words;
      data['totalImageGenerated'] = totalWordGenerated._sum.used_images;

      const rawData = await this.prisma.paymentTransaction.findMany({
        select: {
          created_at: true,
          price: true,
        },
      });

      const weeklySalesData = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
      for (const entry of rawData) {
        const createdAt = entry.created_at;
        const weekName = createdAt.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        weeklySalesData[weekName] += Number(entry.price);
      }

      data['weeklySalesData'] = weeklySalesData;

      data['latest_transaction_list'] =
        await this.prisma.paymentTransaction.findMany({
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
        });
      return successResponse('Admin dashboard data', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateGeneralSettings(payload: UpdateGeneralSettingsDto) {
    try {
      const site_logo_path = payload.site_logo
        ? await fetchMyUploadFilePathById(payload.site_logo)
        : await adminSettingsValueBySlug('site_logo');
      const site_fav_icon_path = payload.site_fav_icon
        ? await fetchMyUploadFilePathById(payload.site_fav_icon)
        : await adminSettingsValueBySlug('site_fav_icon');

      console.log('site_logo_path', site_logo_path);
      const keyValuePairs = Object.entries(payload).map(([key, value]) => {
        if (key === 'site_logo') {
          value = site_logo_path;
        } else if (key === 'site_fav_icon') {
          value = site_fav_icon_path;
        }
        return { key, value };
      });

      await Promise.all(
        keyValuePairs.map((element) =>
          this.updateOrCreate(element.key, element.value),
        ),
      );

      const settings = await getAdminSettingsData(GeneralSettingsSlugs);
      return successResponse('Setting updated successfully', settings);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneralSettingsData() {
    try {
      const slugs: any = GeneralSettingsSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('General settings  data', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateSMTPSettings(payload: updateSMTPSettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const slugs: any = SMTPSettingsSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings is updated!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getSMTPSettingsData() {
    try {
      const slugs: any = SMTPSettingsSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async sendTestMail(
    user: User,
    payload: {
      email: string;
    },
  ): Promise<Promise<ResponseModel>[]> {
    try {
      const mailData = {
        email: payload.email,
      };
      const response: Promise<ResponseModel>[] =
        await this.notificationService.sendTo(new SendTestMail(mailData), user);
      return response;
    } catch (error) {
      processException(error);
    }
  }

  async updateTermsPrivacy(payload: UpdateTermsPrivacyDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const slugs: any = TermsConditionSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse(
        'Privacy policy and Terms condition is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getTermsPrivacyData() {
    try {
      const slugs: any = TermsConditionSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('Privacy policy and Terms condition data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateOpenAISettings(payload: UpdateOpenAISettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(OpenAISettingWithoutSecretSlugs);

      return successResponse('Open AI settings is updated successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiSettingsData() {
    try {
      const data = await getAdminSettingsData(OpenAISettingWithoutSecretSlugs);

      return successResponse('Open AI settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updatePaymentStripeSettings(
    payload: UpdatePaymentMethodStripeSettingsDto,
  ) {
    try {
      payload.pm_stripe_default_currency = 'usdt';
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(PaymentMethodStripeSettingsSlugs);

      return successResponse(
        'Stripe payment method settings is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getPaymentMethodStripeSettingsData() {
    try {
      const data = await getAdminSettingsData(PaymentMethodStripeSettingsSlugs);

      return successResponse('Stripe payment method settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateGoogleAuthSettings(payload: UpdateGoogleAuthSettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(GoogleAuthCredentialsSlugs);

      return successResponse(
        'Google auth credentials is update successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getGoogleAuthSettingsData() {
    try {
      const data = await getAdminSettingsData(GoogleAuthCredentialsSlugs);

      return successResponse('Google auth credentials', data);
    } catch (error) {
      processException(error);
    }
  }
}

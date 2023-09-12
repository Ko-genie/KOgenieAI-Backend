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
  GeneralSettingsSlugs,
  OpenAISettingSlugs,
  SMTPSettingsSlugs,
  TermsConditionSlugs,
} from 'src/shared/constants/array.constants';
import { UpdateTermsPrivacyDto } from './dto/update-terms-privacy.dt';
import { UpdateOpenAISettingsDto } from './dto/update-open-ai-settings.dt';
import { async } from 'rxjs';

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
      if (checkData) {
        await this.prisma.adminSettings.update({
          where: { slug: slugKey },
          data: payload,
        });
      } else {
        await this.prisma.adminSettings.create({
          data: {
            ...payload,
            slug: slugKey,
          },
        });
      }
    } catch (error) {
      processException(error);
    }
  }
  async commonSettings() {
    try {
      const settings = await this.getAllSettings();

      return successResponse('Common settings', settings);
    } catch (error) {
      processException(error);
    }
    return successResponse('ee');
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

  async sendTestMail(user: User) {
    try {
      const mailData = {};
      this.notificationService.send(new SendTestMail(mailData), user);
      return successResponse('Mail is sent successfully!');
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

      const slugs: any = OpenAISettingSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('Open AI settings is updated successfully!', data);
    } catch (error) {
      processException(error);
    }
  }
}

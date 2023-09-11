import {
  errorResponse,
  getAdminSettingsData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { error } from 'console';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  generalSettingsData,
  smtpSettingsData,
} from 'src/shared/constants/array.constants';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

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
      if (payload.site_logo) {
        const siteLogoDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.site_logo,
          },
        });

        if (siteLogoDetails) {
          var site_logo_path = siteLogoDetails.file_path;
        }
      }

      if (payload.site_fav_icon) {
        const siteFavIconDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.site_fav_icon,
          },
        });

        if (siteFavIconDetails) {
          var site_fav_icon_path = siteFavIconDetails.file_path;
        }
      }

      const keyValuePairs = Object.keys(payload).map((key) => {
        const obj = {
          key,
          value: payload[key],
        };

        if (key === 'site_logo') {
          obj.value = site_logo_path;
        } else if (key === 'site_fav_icon') {
          obj.value = site_fav_icon_path;
        }

        return obj;
      });

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const settings = await this.getAllSettings();

      return successResponse('Setting updated successfully', settings);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneralSettingsData() {
    try {
      const slugs: any = generalSettingsData;
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

      const slugs: any = smtpSettingsData;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings is updated!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getSMTPSettingsData() {
    try {
      const slugs: any = smtpSettingsData;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings data!', data);
    } catch (error) {
      processException(error);
    }
  }
}

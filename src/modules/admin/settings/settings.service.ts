import {
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { error } from 'console';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

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
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

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
}

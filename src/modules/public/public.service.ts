import { Injectable } from '@nestjs/common';
import {
  CommonSettingsSlugs,
  CountryListObjectArray,
  LanguageListJsonArray,
} from 'src/shared/constants/array.constants';
import {
  getAdminSettingsData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';

@Injectable()
export class PublicService {
  async getAllLanguageList() {
    const languageList = LanguageListJsonArray;
    return successResponse('Language list', languageList);
  }

  async commonSettings() {
    try {
      const data = {};

      data['countryList'] = CountryListObjectArray;
      data['settings'] = await getAdminSettingsData(CommonSettingsSlugs);

      return successResponse('Common settings', data);
    } catch (error) {
      processException(error);
    }
  }
}

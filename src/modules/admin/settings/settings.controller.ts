import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingService } from './settings.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';

@Controller('admin-settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('common-settings')
  commonSettings(): Promise<ResponseModel> {
    return this.settingService.commonSettings();
  }

  @Post('update-general-settings')
  updateGeneralSettings(
    @Body() payload: UpdateGeneralSettingsDto,
  ): Promise<ResponseModel> {
    return this.settingService.updateGeneralSettings(payload);
  }

  @Get('general-settings-data')
  getGeneralSettingsData(): Promise<ResponseModel> {
    return this.settingService.getGeneralSettingsData();
  }

  @Post('update-smtp-settings')
  updateSMTPSettings(
    @Body() payload: updateSMTPSettingsDto,
  ): Promise<ResponseModel> {
    return this.settingService.updateSMTPSettings(payload);
  }
}

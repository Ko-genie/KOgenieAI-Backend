import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingService } from './settings.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { User } from '@prisma/client';
import { UserInfo } from 'src/shared/decorators/user.decorators';

@IsAdmin()
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

  @Get('smtp-settings-data')
  getSMTPSettingsData(): Promise<ResponseModel> {
    return this.settingService.getSMTPSettingsData();
  }

  @Get('test-mail')
  sendTestMail(@UserInfo() user: User): Promise<ResponseModel> {
    return this.settingService.sendTestMail(user);
  }
}

import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';
import { ResponseModel } from 'src/shared/models/response.model';

@Controller('common')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('language-list')
  getAllLanguageList() {
    return this.publicService.getAllLanguageList();
  }

  @Get('settings')
  commonSettings(): Promise<ResponseModel> {
    return this.publicService.commonSettings();
  }
}

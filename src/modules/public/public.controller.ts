import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('common')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('language-list')
  getAllLanguageList() {
    return this.publicService.getAllLanguageList();
  }
}

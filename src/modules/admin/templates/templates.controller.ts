import { Controller, Post } from '@nestjs/common';
import { TemplateService } from './templates.service';

@Controller('admin-template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('add-category')
  addNewCategory() {
      return this.templateService.addNewCategory();
  }
}

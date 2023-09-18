import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';

@IsAdmin()
@Controller('admin-template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('add-category')
  addNewCategory(@Body() payload: AddNewCategoryDto) {
    return this.templateService.addNewCategory(payload);
  }

  @Post('update-category')
  updateCategory(@Body() payload: UpdateCategoryDto) {
    return this.templateService.updateCategory(payload);
  }

  @Get('category-list')
  getListCategory(@Query() payload: any) {
    return this.templateService.getListCategory(payload);
  };

  @Delete('delete-category-:id')
  deleteCategory(@Param('id') id: number) {
    return this.templateService.deleteCategory(id);
  }

  @Get('category-details-:id')
  getCategoryDetails(@Param('id') id: number) {
    return this.templateService.getCategoryDetails(id);
  }
}

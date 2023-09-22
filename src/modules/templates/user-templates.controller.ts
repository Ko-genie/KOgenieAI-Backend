import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GenerateImageDto } from './dto/generate-image.dto';
import { TemplateService } from './templates.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { SubscriptionGuard } from 'src/shared/guards/Subscription.guard';
import { Subscription } from 'src/shared/decorators/subcription.decorators';
import { userInfo } from 'os';
import { paginateType } from '../payments/dto/query.dto';
import { paginateInterface } from 'src/shared/constants/types';

@Controller('user')
export class UserTemplateController {
  constructor(private readonly templateService: TemplateService) {}
  @Subscription('text')
  @Post('generate-content')
  generateOpenAiContent(
    @UserInfo() user: User,
    @Body()
    payload: any,
  ) {
    return this.templateService.generateContent(user, payload);
  }
  @Subscription('image')
  @Post('generate-image')
  generateImage(
    @UserInfo() user: User,
    @Body()
    payload: GenerateImageDto,
  ) {
    return this.templateService.generateImage(user, payload);
  }

  @Get('document-list')
  getDocumentListByPaginate(@Query() payload: paginateInterface) {
    return this.templateService.getDocumentListByPaginate(payload);
  }
  @Get('my-image-list')
  getAllImageDocument(
    @Query() payload: paginateInterface,
    @UserInfo() user: User,
  ) {
    return this.templateService.getAllImageDocument(user, payload);
  }

  @Get('document-details-:id')
  getUserDocumentDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getUserDocumentDetails(id, user);
  }
  @Get('image-details-:id')
  getImageDocumentDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getImageDocumentDetails(id, user);
  }
}

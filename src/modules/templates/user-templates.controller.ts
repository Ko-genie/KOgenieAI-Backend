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
  getDocumentListByPaginate(@Query() payload: any) {
    return this.templateService.getDocumentListByPaginate(payload);
  }

  @Get('document-details-:id')
  getUserDocumentDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getUserDocumentDetails(id, user);
  }
}

import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { GenerateOpenAiContentDto } from './dto/generate-content-open-ai.dto';
import { TemplateService } from './templates.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';

@Controller('user')
export class UserTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('generate-content')
  generateOpenAiContent(
    @UserInfo() user:User,
    @Body()
    payload: any,
  ) {
    return this.templateService.generateContent(user,payload);
  }
}

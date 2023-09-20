import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { GenerateOpenAiContentDto } from './dto/generate-content-open-ai.dto';
import { TemplateService } from './templates.service';

@Controller('user')
export class UserTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('generate-content')
  generateOpenAiContent(
    @Body()
    payload: any,
  ) {
    return this.templateService.generateContent(payload);
  }
}

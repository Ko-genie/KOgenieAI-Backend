import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OpenAiChatService } from './openai-chat.service';
import { CreateOpenAiChatDto } from './dto/create-openai-chat.dto';

@Controller('admin')
export class AdminOpenAiChatController {
  constructor(private readonly openAiChatService: OpenAiChatService) {}

  @Post('create-chat-category')
  createChatCategory(@Body() payload: CreateOpenAiChatDto) {
    return this.openAiChatService.createChatCategory(payload);
  }

  @Get('openai-chat-category-list')
  getOpenAiChatCategoryList(@Query() payload: any) {
    return this.openAiChatService.getOpenAiChatCategoryListForAdmin(payload);
  }
    
    @Get('get-openai-chat-category-details-:id')
    getOpenAiChatCategoryDetails(@Param('id') id: number)
    {
        return this.openAiChatService.getOpenAiChatCategoryDetails(id);
    }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { StartNewChat } from './dto/start-new-chat.dto';
import { OpenAiChatService } from './openai-chat.service';
import { SendOpenAiChatMessageDto } from './dto/send-openai-chat-message.dto';

@Controller('user')
export class UserOpenAiChatController {
  constructor(private readonly openAiChatService: OpenAiChatService) {}

  @Post('start-new-chat')
  startNewChat(@UserInfo() user: User, @Body() payload: StartNewChat) {
    return this.openAiChatService.startNewChat(user, payload);
  }

  @Get('get-openai-chat-category-list-:id')
  getOpenAiChatCategoryList(
    @UserInfo() user: User,
    @Param('id') id: number,
    @Query() payload: any,
  ) {
    return this.openAiChatService.getOpenAiChatCategoryList(user, id, payload);
  }

  @Get('get-openai-chat-list-:id')
  getOpenAiChatList(
    @UserInfo() user: User,
    @Param('id') id: number,
    @Query() payload: any,
  ) {
    return this.openAiChatService.getOpenAiChatList(user, id, payload);
  }

  @Post('send-openai-chat-message')
  sendOpenAiChatMessage(
    @UserInfo() user: User,
    @Body() payload: SendOpenAiChatMessageDto,
  ) {
    return this.openAiChatService.sendOpenAiChatMessage(user, payload);
  }
}

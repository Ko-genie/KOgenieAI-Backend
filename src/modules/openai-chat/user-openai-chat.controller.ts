import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { StartNewChat } from './dto/start-new-chat.dto';
import { OpenAiChatService } from './openai-chat.service';

@Controller('user')
export class UserOpenAiChatController {
  constructor(private readonly openAiChatService: OpenAiChatService) {}

  @Post('start-new-chat')
  startNewChat(@UserInfo() user: User, @Body() payload: StartNewChat) {
    return this.openAiChatService.startNewChat(user, payload);
  }
}

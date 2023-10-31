import { Module } from '@nestjs/common';
import { AdminOpenAiChatController } from './admin-openai-chat.controller';
import { OpenAiChatService } from './openai-chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserOpenAiChatController } from './user-openai-chat.controller';

@Module({
  controllers: [AdminOpenAiChatController, UserOpenAiChatController],
  providers: [OpenAiChatService],
  imports: [PrismaModule],
  exports: [OpenAiChatService],
})
export class OpenAiChatModule {}

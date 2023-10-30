import { Module } from '@nestjs/common';
import { AdminOpenAiChatController } from './admin-openai-chat.controller';
import { OpenAiChatService } from './openai-chat.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AdminOpenAiChatController],
  providers: [OpenAiChatService],
  imports: [PrismaModule],
  exports: [OpenAiChatService],
})
export class OpenAiChatModule {}

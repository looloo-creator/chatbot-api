import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OllamaService } from '../llm/ollama.service';
import { ToolsService } from '../tools/tools.service';
import { PostgresService } from '../database/postgres.service';
import { ChatAuthGuard } from './chat-auth.guard';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatAuthGuard, OllamaService, ToolsService, PostgresService],
})
export class ChatModule {}

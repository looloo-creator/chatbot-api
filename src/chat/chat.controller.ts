import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthenticatedChatRequest, ChatAuthGuard } from './chat-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(ChatAuthGuard)
  @Post('message')
  async sendMessage(
    @Body() body: { message: string; conversationId: string },
    @Req() request: AuthenticatedChatRequest,
  ): Promise<any> {
    const conversationId = this.validateConversationId(body?.conversationId);
    const message = body?.message;
    if (typeof message !== 'string' || !message.trim() || message.length > 10000) {
      throw new BadRequestException('Message must be between 1 and 10000 characters');
    }

    return this.chatService.processMessage(message.trim(), this.scope(request, conversationId), Number(request.chatUserId));
  }

  @UseGuards(ChatAuthGuard)
  @Post('knowledge')
  async addKnowledge(@Body() body: { content: string; title?: string }, @Req() request: AuthenticatedChatRequest): Promise<any> {
    if (typeof body?.content !== 'string' || !body.content.trim() || body.content.length > 100000) {
      throw new BadRequestException('Knowledge content must be between 1 and 100000 characters');
    }
    await this.chatService.indexKnowledge(body.content.trim(), Number(request.chatUserId), { title: body.title || '' });
    return { success: true };
  }

  @UseGuards(ChatAuthGuard)
  @Get('history')
  getHistory(
    @Query('conversationId') rawConversationId: string,
    @Req() request: AuthenticatedChatRequest,
  ): any {
    const conversationId = this.validateConversationId(rawConversationId);
    return {
      conversationId,
      ...this.chatService.getConversationHistory(this.scope(request, conversationId)),
    };
  }

  @UseGuards(ChatAuthGuard)
  @Post('clear')
  clearHistory(
    @Body() body: { conversationId: string },
    @Req() request: AuthenticatedChatRequest,
  ): any {
    const conversationId = this.validateConversationId(body?.conversationId);
    this.chatService.clearConversation(this.scope(request, conversationId));
    return { message: 'Conversation history cleared' };
  }

  @Get('health')
  async checkHealth(): Promise<any> {
    const isHealthy = await this.chatService.checkHealth();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: isHealthy
        ? 'Ollama is running and accessible'
        : 'Failed to connect to Ollama',
    };
  }

  private validateConversationId(conversationId?: string): string {
    if (conversationId === undefined || conversationId === '') return 'default-chat';
    if (typeof conversationId !== 'string' || !/^[a-zA-Z0-9_-]{8,128}$/.test(conversationId)) {
      throw new BadRequestException('A valid conversationId is required');
    }
    return conversationId;
  }

  private scope(request: AuthenticatedChatRequest, conversationId: string): string {
    return `${request.chatUserId}:${conversationId}`;
  }
}

import { Injectable } from '@nestjs/common';
import { OllamaService } from '../llm/ollama.service';

@Injectable()
export class ChatService {
  constructor(private ollamaService: OllamaService) {}

  async processMessage(userMessage: string, conversationId: string): Promise<any> {
    try {
      const result = await this.ollamaService.chat(userMessage, conversationId);
      return {
        success: true,
        response: result.response,
        toolResults: result.toolResults || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getConversationHistory(conversationId: string): any {
    return {
      history: this.ollamaService.getHistory(conversationId),
    };
  }

  clearConversation(conversationId: string): void {
    this.ollamaService.clearHistory(conversationId);
  }

  async checkHealth(): Promise<boolean> {
    return await this.ollamaService.checkHealth();
  }
}

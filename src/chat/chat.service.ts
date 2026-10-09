import { Injectable } from '@nestjs/common';
import { OllamaService } from '../llm/ollama.service';

@Injectable()
export class ChatService {
  constructor(private ollamaService: OllamaService) {}

  async processMessage(userMessage: string, conversationId: string, userId: number): Promise<any> {
    try {
      const result = await this.ollamaService.chat(userMessage, userId, conversationId);
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

  async indexKnowledge(content: string, userId: number, metadata: Record<string, unknown> = {}): Promise<void> {
    await this.ollamaService.indexKnowledge(content, userId, metadata);
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

import { Injectable } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { ToolResult } from './tools';

@Injectable()
export class ToolsService {
  constructor(private postgresService: PostgresService) {}

  async executeToolCall(toolName: string, parameters: any, userId: number): Promise<ToolResult> {
    try {
      let result;

      switch (toolName) {
        case 'get_user_balance':
          result = await this.postgresService.getUserBalance(userId);
          break;

        case 'get_member_balance':
          result = await this.postgresService.getMemberBalance(parameters.member_id, userId);
          break;

        case 'get_all_members_with_balance':
          result = await this.postgresService.getMembersWithBalance(userId);
          break;

        case 'get_account_balance':
          result = await this.postgresService.getAccount(parameters.account_id, userId);
          break;

        case 'get_tour_payment_status':
          result = await this.postgresService.getTourPaymentStatus(parameters.tour_id, userId);
          break;

        case 'get_my_tours':
          result = await this.postgresService.getMyTours(userId);
          break;

        case 'search_user_by_name':
          result = await this.postgresService.searchMembersByName(parameters.name, userId);
          break;

        default:
          return {
            tool: toolName,
            error: `Unknown tool: ${toolName}`,
            result: null,
          };
      }

      return {
        tool: toolName,
        result: result,
      };
    } catch (error) {
      return {
        tool: toolName,
        error: error.message,
        result: null,
      };
    }
  }

}

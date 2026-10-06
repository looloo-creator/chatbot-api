import { Injectable } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { MongodbService } from '../database/mongodb.service';
import { ToolResult } from './tools';

@Injectable()
export class ToolsService {
  constructor(
    private postgresService: PostgresService,
    private mongodbService: MongodbService,
  ) {}

  async executeToolCall(toolName: string, parameters: any): Promise<ToolResult> {
    try {
      let result;

      switch (toolName) {
        case 'get_user_balance':
          result = await this.postgresService.getUserBalance(parameters.user_id);
          break;

        case 'get_all_users_balance':
          result = await this.postgresService.getAllUsersBalance();
          break;

        case 'get_member_balance':
          result = await this.mongodbService.getMemberBalance(parameters.member_id);
          break;

        case 'get_all_members_with_balance':
          result = await this.mongodbService.getAllMembersWithBalance();
          break;

        case 'get_account_balance':
          result = await this.mongodbService.getAccountBalance(parameters.account_id);
          break;

        case 'get_tour_payment_status':
          result = await this.mongodbService.getTourPaymentStatus(parameters.tour_id);
          break;

        case 'search_user_by_name':
          result = await this.searchUserByName(parameters.name);
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

  private async searchUserByName(name: string): Promise<any> {
    const sql = `SELECT id, username AS name, email FROM users WHERE username ILIKE $1 OR email ILIKE $1 ORDER BY id LIMIT 10`;
    return this.postgresService.query(sql, [`%${name}%`]);
  }
}

// Tool definitions for the chatbot
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const TOOLS: ToolDefinition[] = [
  {
    name: 'get_user_balance',
    description: 'Get a user and balance record from PostgreSQL. Balance totals are included only when a transactions table with user_id, type, and amount columns exists; otherwise balance_available is false.',
    parameters: {
      type: 'object',
      properties: {
        user_id: {
          type: 'number',
          description: 'The unique ID of the user',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'get_all_users_balance',
    description: 'Get users and balance records from PostgreSQL. Balance totals are included only when a transactions table with user_id, type, and amount columns exists; otherwise balance_available is false.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_member_balance',
    description: 'Get balance information for a specific member from MongoDB. Returns member details including transactions and balance.',
    parameters: {
      type: 'object',
      properties: {
        member_id: {
          type: 'string',
          description: 'The MongoDB ObjectId of the member',
        },
      },
      required: ['member_id'],
    },
  },
  {
    name: 'get_all_members_with_balance',
    description: 'Get balance information for all members from MongoDB. Shows detailed balance for each member in the system.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_account_balance',
    description: 'Get balance information for a specific account from MongoDB. Returns account details and current balance.',
    parameters: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The MongoDB ObjectId of the account',
        },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'get_tour_payment_status',
    description: 'Get payment status information for a specific tour from MongoDB. Returns tour details and payment information.',
    parameters: {
      type: 'object',
      properties: {
        tour_id: {
          type: 'string',
          description: 'The MongoDB ObjectId of the tour',
        },
      },
      required: ['tour_id'],
    },
  },
  {
    name: 'search_user_by_name',
    description:
      'Search for users by name to find their ID. Helpful when user asks about a person but only provides their name.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name or partial name of the user to search for',
        },
      },
      required: ['name'],
    },
  },
];

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  tool: string;
  result: any;
  error?: string;
}

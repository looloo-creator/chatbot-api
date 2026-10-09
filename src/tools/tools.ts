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
    name: 'get_my_tours',
    description: 'List only the signed-in user’s active tours. Use this to find a tour by plan/name before querying its report.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_user_balance',
    description: 'Get the signed-in user’s exact collection, expenditure, and balance totals across their active accounts.',
    parameters: {
      type: 'object',
      properties: {
      },
      required: [],
    },
  },
  {
    name: 'get_member_balance',
    description: 'Get this signed-in user’s member balance from PostgreSQL. Uses the app report rule: each included account is divided evenly among its selected members.',
    parameters: {
      type: 'object',
      properties: {
        member_id: {
          type: 'string',
          description: 'The member ID returned by search_user_by_name or get_all_members_with_balance',
        },
      },
      required: ['member_id'],
    },
  },
  {
    name: 'get_all_members_with_balance',
    description: 'List members belonging only to the signed-in user, from PostgreSQL.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_account_balance',
    description: 'Get one account belonging to the signed-in user from PostgreSQL.',
    parameters: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The account ID',
        },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'get_tour_payment_status',
    description: 'Get the signed-in user’s tour and exact collection, expenditure, and balance totals from PostgreSQL.',
    parameters: {
      type: 'object',
      properties: {
        tour_id: {
          type: 'string',
          description: 'The tour ID returned by this user’s tour list or known from the conversation',
        },
      },
      required: ['tour_id'],
    },
  },
  {
    name: 'search_user_by_name',
    description:
      'Search this signed-in user’s tour members by name. Never searches other users.',
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

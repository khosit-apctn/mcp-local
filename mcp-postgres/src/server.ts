import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { listTables, describeTable } from './tools/schema.js';
import { selectRows, insertRow, updateRows, deleteRows } from './tools/crud.js';
import { executeQuery } from './tools/query.js';

const server = new Server(
  {
    name: 'mcp-postgres',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_tables',
        description: 'List user tables in a database schema',
        inputSchema: {
          type: 'object',
          properties: {
            schema: { type: 'string', description: 'Defaults to public' }
          }
        }
      },
      {
        name: 'describe_table',
        description: 'Show column information and details for a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string' },
            schema: { type: 'string', description: 'Defaults to public' }
          },
          required: ['table']
        }
      },
      {
        name: 'select_rows',
        description: 'Queries rows from a table with filters. Escapes identifiers safely.',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string' },
            schema: { type: 'string' },
            columns: { type: 'array', items: { type: 'string' } },
            filters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: {
                    type: 'string',
                    enum: ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'IS', 'IS NOT']
                  },
                  value: {}
                },
                required: ['column', 'operator', 'value']
              }
            },
            orderBy: { type: 'string' },
            orderDirection: { type: 'string', enum: ['ASC', 'DESC'] },
            limit: { type: 'integer' },
            offset: { type: 'integer' }
          },
          required: ['table']
        }
      },
      {
        name: 'insert_row',
        description: 'Inserts a new row with key-value data.',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string' },
            schema: { type: 'string' },
            data: { type: 'object', description: 'Column-value mapping' }
          },
          required: ['table', 'data']
        }
      },
      {
        name: 'update_rows',
        description: 'Updates rows matching filters.',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string' },
            schema: { type: 'string' },
            data: { type: 'object', description: 'Values to set' },
            filters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: {
                    type: 'string',
                    enum: ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'IS', 'IS NOT']
                  },
                  value: {}
                },
                required: ['column', 'operator', 'value']
              }
            }
          },
          required: ['table', 'data', 'filters']
        }
      },
      {
        name: 'delete_rows',
        description: 'Deletes rows matching filters.',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string' },
            schema: { type: 'string' },
            filters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: {
                    type: 'string',
                    enum: ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'IS', 'IS NOT']
                  },
                  value: {}
                },
                required: ['column', 'operator', 'value']
              }
            }
          },
          required: ['table', 'filters']
        }
      },
      {
        name: 'execute_query',
        description: 'Executes raw SQL query. Warning: LLMs must avoid destructive queries (e.g. DROP or TRUNCATE) unless explicitly requested.',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string' },
            params: { type: 'array' }
          },
          required: ['sql']
        }
      }
    ]
  };
});

// Call dynamic tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result;
    switch (name) {
      case 'list_tables':
        result = await listTables((args as any)?.schema);
        break;
      case 'describe_table':
        result = await describeTable((args as any).table, (args as any).schema);
        break;
      case 'select_rows':
        result = await selectRows(args as any);
        break;
      case 'insert_row':
        result = await insertRow((args as any).table, (args as any).data, (args as any).schema);
        break;
      case 'update_rows':
        result = await updateRows((args as any).table, (args as any).data, (args as any).filters, (args as any).schema);
        break;
      case 'delete_rows':
        result = await deleteRows((args as any).table, (args as any).filters, (args as any).schema);
        break;
      case 'execute_query':
        result = await executeQuery((args as any).sql, (args as any).params);
        break;
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      isError: true,
      content: [{ type: 'text', text: error.message || String(error) }]
    };
  }
});

export async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Postgres Local MCP Server running on stdio transport.");
}

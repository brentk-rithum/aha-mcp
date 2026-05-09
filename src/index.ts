#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import { Handlers } from "./handlers.js";

const AHA_API_TOKEN = process.env.AHA_API_TOKEN;
const AHA_DOMAIN = process.env.AHA_DOMAIN;
const AHA_PROJECT_ID = process.env.AHA_PROJECT_ID;

if (!AHA_API_TOKEN) {
  throw new Error("AHA_API_TOKEN environment variable is required");
}

if (!AHA_DOMAIN) {
  throw new Error("AHA_DOMAIN environment variable is required");
}

const client = new GraphQLClient(
  `https://${AHA_DOMAIN}.aha.io/api/v2/graphql`,
  {
    headers: {
      Authorization: `Bearer ${AHA_API_TOKEN}`,
    },
  }
);

class AhaMcp {
  private server: Server;
  private handlers: Handlers;

  constructor() {
    this.server = new Server(
      {
        name: "aha-mcp",
        version: "1.2.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.handlers = new Handlers(client, AHA_PROJECT_ID);
    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_record",
          description: "Get an Aha! feature or requirement by reference number",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description:
                  "Reference number (e.g., DEVELOP-123 or ADT-123-1)",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "get_page",
          description:
            "Get an Aha! page by reference number with optional relationships",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Reference number (e.g., ABC-N-213)",
              },
              includeParent: {
                type: "boolean",
                description: "Include parent page in the response",
                default: false,
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "search_documents",
          description: "Search for Aha! documents",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string",
              },
              searchableType: {
                type: "string",
                description: "Type of document to search for (e.g., Page)",
                default: "Page",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "search_ideas",
          description:
            "Search Aha! ideas with optional filters. Returns idea details including votes, score, workflow status, description, and all custom fields. Use updatedSince (ISO 8601) to fetch only recently updated ideas.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string (leave empty to list all ideas)",
              },
              workflowStatus: {
                type: "string",
                description:
                  "Filter by workflow status name (e.g., 'Submitted', 'Under consideration'). Filtering is applied client-side.",
              },
              updatedSince: {
                type: "string",
                description:
                  "Return ideas updated at or after this ISO 8601 timestamp (e.g., '2026-05-03T00:00:00Z'). Use for date-windowed fetches.",
              },
              projectId: {
                type: "string",
                description:
                  "Aha! project ID to scope results. Overrides AHA_PROJECT_ID env var if provided.",
              },
            },
            required: [],
          },
        },
        {
          name: "get_idea_portal_fields",
          description:
            "List all custom field definitions configured for the Aha! ideas portal project. Returns field keys, display names, and types — useful for discovering keys like risk_to_renewal, blocker_to_use, etc. before they appear on any idea.",
          inputSchema: {
            type: "object",
            properties: {
              projectId: {
                type: "string",
                description:
                  "Aha! project ID. Overrides AHA_PROJECT_ID env var if provided.",
              },
            },
            required: [],
          },
        },
        {
          name: "introspect_idea_type",
          description: "Run GraphQL introspection on any Aha! type to list its fields. Defaults to 'Idea'. Pass typeName to inspect other types (e.g. 'ScreenDefinition', 'IdeasIdeaPortal', 'Project').",
          inputSchema: {
            type: "object",
            properties: {
              typeName: { type: "string", description: "GraphQL type name to introspect (default: 'Idea')" },
            },
            required: [],
          },
        },
        {
          name: "get_idea",
          description:
            "Get a single Aha! idea by reference number. Returns full idea details including all custom fields, tags, workflow status, votes, and description.",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Idea reference number (e.g., 'APP-I-123')",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "update_idea",
          description:
            "Update fields on an Aha! idea. Supports built-in fields (status, name, score, assignee, tags) and custom fields via key-value pairs.",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Idea reference number (e.g., 'APP-I-123') or internal ID",
              },
              fields: {
                type: "object",
                description: "Fields to update on the idea",
                properties: {
                  name: { type: "string", description: "New idea name" },
                  workflowStatus: {
                    type: "string",
                    description: "Workflow status name to set",
                  },
                  score: { type: "number", description: "Idea score (priority)" },
                  assignedToUser: {
                    type: "string",
                    description: "Email of user to assign the idea to",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Full tags array to set on the idea (replaces existing tags)",
                  },
                  customFields: {
                    type: "array",
                    description: "Custom fields to update as key-value pairs",
                    items: {
                      type: "object",
                      properties: {
                        key: {
                          type: "string",
                          description: "Custom field key (e.g., 'value_to_rithum', 'impact')",
                        },
                        value: {
                          type: "string",
                          description: "Value to set for the custom field",
                        },
                      },
                      required: ["key", "value"],
                    },
                  },
                },
              },
            },
            required: ["id", "fields"],
          },
        },
        {
          name: "post_idea_comment",
          description: "Post a comment on an Aha! idea to engage with the requester",
          inputSchema: {
            type: "object",
            properties: {
              ideaId: {
                type: "string",
                description: "Idea reference number (e.g., 'APP-I-123') or internal ID",
              },
              body: {
                type: "string",
                description: "Comment text (HTML supported)",
              },
            },
            required: ["ideaId", "body"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "get_record") {
        return this.handlers.handleGetRecord(request);
      } else if (request.params.name === "get_page") {
        return this.handlers.handleGetPage(request);
      } else if (request.params.name === "search_documents") {
        return this.handlers.handleSearchDocuments(request);
      } else if (request.params.name === "search_ideas") {
        return this.handlers.handleSearchIdeas(request);
      } else if (request.params.name === "get_idea_portal_fields") {
        return this.handlers.handleGetIdeaPortalFields(request);
      } else if (request.params.name === "introspect_idea_type") {
        return this.handlers.handleIntrospectIdeaType(request);
      } else if (request.params.name === "get_idea") {
        return this.handlers.handleGetIdea(request);
      } else if (request.params.name === "update_idea") {
        return this.handlers.handleUpdateIdea(request);
      } else if (request.params.name === "post_idea_comment") {
        return this.handlers.handlePostIdeaComment(request);
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Aha! MCP server running on stdio");
  }
}

const server = new AhaMcp();
server.run().catch(console.error);

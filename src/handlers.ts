import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import {
  FEATURE_REF_REGEX,
  REQUIREMENT_REF_REGEX,
  NOTE_REF_REGEX,
  Record,
  FeatureResponse,
  RequirementResponse,
  PageResponse,
  SearchResponse,
  IdeaAttributes,
  SearchIdeasResponse,
  GetIdeaResponse,
  UpdateIdeaResponse,
  CreateIdeaCommentResponse,
} from "./types.js";
import {
  getFeatureQuery,
  getRequirementQuery,
  getPageQuery,
  searchDocumentsQuery,
  searchIdeasQuery,
  getIdeaQuery,
  updateIdeaMutation,
  createIdeaCommentMutation,
} from "./queries.js";

export class Handlers {
  constructor(private client: GraphQLClient) {}

  async handleGetRecord(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    try {
      let result: Record | undefined;

      if (FEATURE_REF_REGEX.test(reference)) {
        const data = await this.client.request<FeatureResponse>(
          getFeatureQuery,
          {
            id: reference,
          }
        );
        result = data.feature;
      } else if (REQUIREMENT_REF_REGEX.test(reference)) {
        const data = await this.client.request<RequirementResponse>(
          getRequirementQuery,
          { id: reference }
        );
        result = data.requirement;
      } else {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid reference number format. Expected DEVELOP-123 or ADT-123-1"
        );
      }

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No record found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch record: ${errorMessage}`
      );
    }
  }

  async handleGetPage(request: any) {
    const { reference, includeParent = false } = request.params.arguments as {
      reference: string;
      includeParent?: boolean;
    };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    if (!NOTE_REF_REGEX.test(reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid reference number format. Expected ABC-N-213"
      );
    }

    try {
      const data = await this.client.request<PageResponse>(getPageQuery, {
        id: reference,
        includeParent,
      });

      if (!data.page) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.page, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch page: ${errorMessage}`
      );
    }
  }

  async handleSearchDocuments(request: any) {
    const { query, searchableType = "Page" } = request.params.arguments as {
      query: string;
      searchableType?: string;
    };

    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, "Search query is required");
    }

    try {
      const data = await this.client.request<SearchResponse>(
        searchDocumentsQuery,
        {
          query,
          searchableType: [searchableType],
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.searchDocuments, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search documents: ${errorMessage}`
      );
    }
  }

  async handleSearchIdeas(request: any) {
    const { query, workflowStatus, updatedSince } = request.params.arguments as {
      query?: string;
      workflowStatus?: string;
      updatedSince?: string;
    };

    try {
      const data = await this.client.request<SearchIdeasResponse>(
        searchIdeasQuery,
        { query, updatedSince }
      );

      let ideas = data.ideas.nodes;

      // Client-side filter by workflow status name (API requires ID, we filter by name)
      if (workflowStatus) {
        const statusLower = workflowStatus.toLowerCase();
        ideas = ideas.filter(
          (idea) => idea.workflowStatus?.name?.toLowerCase() === statusLower
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ...data.ideas, nodes: ideas }, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search ideas: ${errorMessage}`
      );
    }
  }

  async handleGetIdea(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(ErrorCode.InvalidParams, "Idea reference is required");
    }

    try {
      const data = await this.client.request<GetIdeaResponse>(getIdeaQuery, {
        id: reference,
      });

      if (!data.idea) {
        return {
          content: [
            {
              type: "text",
              text: `No idea found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.idea, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch idea: ${errorMessage}`
      );
    }
  }

  async handleUpdateIdea(request: any) {
    const { id, fields } = request.params.arguments as {
      id: string;
      fields: IdeaAttributes;
    };

    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, "Idea ID is required");
    }

    if (!fields || Object.keys(fields).length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "At least one field to update is required"
      );
    }

    try {
      const data = await this.client.request<UpdateIdeaResponse>(
        updateIdeaMutation,
        { id, idea: fields }
      );

      if (data.updateIdea.errors.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Update failed: ${data.updateIdea.errors.map((e) => e.message).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.updateIdea.idea, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update idea: ${errorMessage}`
      );
    }
  }

  async handlePostIdeaComment(request: any) {
    const { ideaId, body } = request.params.arguments as {
      ideaId: string;
      body: string;
    };

    if (!ideaId) {
      throw new McpError(ErrorCode.InvalidParams, "Idea ID is required");
    }

    if (!body) {
      throw new McpError(ErrorCode.InvalidParams, "Comment body is required");
    }

    try {
      const data = await this.client.request<CreateIdeaCommentResponse>(
        createIdeaCommentMutation,
        { ideaId, body }
      );

      if (data.createIdeaComment.errors.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Comment failed: ${data.createIdeaComment.errors.map((e) => e.message).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.createIdeaComment.ideaComment, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to post comment: ${errorMessage}`
      );
    }
  }
}

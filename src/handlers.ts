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
  GetIdeaPortalFieldsResponse,
  SetCustomFieldValuesResponse,
  GetProjectMetadataResponse,
} from "./types.js";
import {
  getFeatureQuery,
  getRequirementQuery,
  getPageQuery,
  searchDocumentsQuery,
  searchIdeasQuery,
  getIdeaQuery,
  updateIdeaMutation,
  setCustomFieldValuesMutation,
  createIdeaCommentMutation,
  getIdeaPortalFieldsQuery,
  introspectTypeQuery,
  getProjectMetadataQuery,
} from "./queries.js";

export class Handlers {
  constructor(private client: GraphQLClient, private projectId?: string) {}

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
    const { query, workflowStatus, updatedSince, projectId: paramProjectId } = request.params.arguments as {
      query?: string;
      workflowStatus?: string;
      updatedSince?: string;
      projectId?: string;
    };

    const projectId = paramProjectId ?? this.projectId;

    try {
      const data = await this.client.request<SearchIdeasResponse>(
        searchIdeasQuery,
        { query, projectId }
      );

      let ideas = data.ideas.nodes;

      if (updatedSince) {
        const since = new Date(updatedSince);
        ideas = ideas.filter((idea) => new Date(idea.updatedAt) >= since);
      }

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
    let { id, fields } = request.params.arguments as {
      id: string;
      fields: IdeaAttributes | string;
    };

    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, "Idea ID is required");
    }

    // Guard: fields may arrive as JSON string depending on MCP client serialization
    if (typeof fields === "string") {
      try {
        fields = JSON.parse(fields) as IdeaAttributes;
      } catch {
        throw new McpError(ErrorCode.InvalidParams, "fields must be a valid JSON object");
      }
    }

    if (!fields || Object.keys(fields as object).length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "At least one field to update is required"
      );
    }

    try {
      const data = await this.client.request<UpdateIdeaResponse>(
        updateIdeaMutation,
        { id, attributes: fields }
      );

      if (data.updateIdea.errors.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Update failed: ${JSON.stringify(data.updateIdea.errors)}`,
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

  async handleGetIdeaPortalFields(request: any) {
    const { ideaRef } = (request.params.arguments ?? {}) as {
      ideaRef?: string;
    };

    const ref = ideaRef ?? "IDEA-I-5623";

    try {
      const data = await this.client.request<GetIdeaPortalFieldsResponse>(
        getIdeaPortalFieldsQuery,
        { id: ref }
      );

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
        `Failed to fetch idea portal fields: ${errorMessage}`
      );
    }
  }

  async handleIntrospectIdeaType(request: any) {
    const { typeName = "Idea" } = (request.params.arguments ?? {}) as { typeName?: string };
    try {
      const data = await this.client.request<any>(introspectTypeQuery, { typeName });
      return {
        content: [{ type: "text", text: JSON.stringify(data.__type, null, 2) }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Introspection failed: ${errorMessage}`);
    }
  }

  async handleGetProjectMetadata(request: any) {
    const { projectId: paramProjectId } = (request.params.arguments ?? {}) as { projectId?: string };
    const projectId = paramProjectId ?? this.projectId;

    if (!projectId) {
      throw new McpError(ErrorCode.InvalidParams, "projectId is required (or set AHA_PROJECT_ID env var)");
    }

    try {
      const data = await this.client.request<GetProjectMetadataResponse>(
        getProjectMetadataQuery,
        { projectId }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(data.project, null, 2) }],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to fetch project metadata: ${errorMessage}`);
    }
  }

  async handleSetIdeaCustomFields(request: any) {
    let { id, customFields, typename = "Idea" } = request.params.arguments as {
      id: string;
      customFields: Array<{ key: string; value: unknown }> | string;
      typename?: string;
    };

    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, "Idea ID is required");
    }

    if (typeof customFields === "string") {
      try {
        customFields = JSON.parse(customFields) as Array<{ key: string; value: unknown }>;
      } catch {
        throw new McpError(ErrorCode.InvalidParams, "customFields must be a valid JSON array");
      }
    }

    if (!Array.isArray(customFields) || customFields.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, "customFields must be a non-empty array of {key, value} objects");
    }

    try {
      const data = await this.client.request<SetCustomFieldValuesResponse>(
        setCustomFieldValuesMutation,
        { id, typename, customFieldValues: customFields }
      );

      if (data.setCustomFieldValues.errors.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Set custom fields failed: ${JSON.stringify(data.setCustomFieldValues.errors)}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.setCustomFieldValues.customFieldValues, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to set custom fields: ${errorMessage}`);
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
        { id: ideaId, typename: "Idea", body }
      );

      if (data.createComment.errors.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Comment failed: ${JSON.stringify(data.createComment.errors)}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.createComment.comment, null, 2),
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

export interface Description {
  htmlBody: string;
}

export interface Record {
  name: string;
  description: Description;
}

export interface FeatureResponse {
  feature: Record;
}

export interface RequirementResponse {
  requirement: Record;
}

export interface PageResponse {
  page: {
    name: string;
    description: Description;
    children: Array<{
      name: string;
      referenceNum: string;
    }>;
    parent?: {
      name: string;
      referenceNum: string;
    };
  };
}

// Regular expressions for validating reference numbers
export const FEATURE_REF_REGEX = /^([A-Z][A-Z0-9]*)-(\d+)$/;
export const REQUIREMENT_REF_REGEX = /^([A-Z][A-Z0-9]*)-(\d+)-(\d+)$/;
export const NOTE_REF_REGEX = /^([A-Z][A-Z0-9]*)-N-(\d+)$/;
export const IDEA_REF_REGEX = /^([A-Z][A-Z0-9]*)-I-(\d+)$/;

export interface SearchNode {
  name: string | null;
  url: string;
  searchableId: string;
  searchableType: string;
}

export interface SearchResponse {
  searchDocuments: {
    nodes: SearchNode[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export interface IdeaDescription {
  htmlBody: string;
}

export interface WorkflowStatus {
  name: string;
}

export interface IdeaProject {
  id?: string;
  name: string;
  referencePrefix: string;
}

export interface IdeaUser {
  id: string;
  name: string | null;
  email: string | null;
}

export interface IdeaContributor {
  id: string;
  name: string | null;
  email: string | null;
}

export interface IdeaTag {
  name: string;
}

export interface IdeaCategory {
  name: string;
}

export interface CustomFieldValue {
  key: string;
  value: string | null;
}

export interface Idea {
  id: string;
  referenceNum: string;
  name: string;
  description: IdeaDescription;
  workflowStatus: WorkflowStatus;
  score: number | null;
  votes: number;
  createdAt: string;
  updatedAt: string;
  resourceUrl: string;
  project: IdeaProject;
  contributorship: IdeaContributor | null;
  assignedToUser: IdeaUser | null;
  tags: IdeaTag[];
  ideaCategories: IdeaCategory[];
  customFieldValues: CustomFieldValue[];
  screenDefinition?: ScreenDefinition | null;
}

export interface IdeaCustomFieldInput {
  key: string;
  value: string;
}

export interface IdeaAttributes {
  name?: string;
  workflowStatus?: string;
  score?: number;
  assignedToUser?: string;
  tags?: string[];
  customFields?: IdeaCustomFieldInput[];
}

export interface IdeaComment {
  id: string;
  body: string;
  createdAt: string;
}

export interface SearchIdeasResponse {
  ideas: {
    nodes: Idea[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export interface GetIdeaResponse {
  idea: Idea | null;
}

export interface UpdateIdeaResponse {
  updateIdea: {
    idea: Pick<Idea, "id" | "referenceNum" | "name" | "workflowStatus" | "tags" | "customFieldValues"> | null;
    errors: Array<{ attributes: Array<{ name: string; messages: string[] }> }>;
  };
}

export interface CustomFieldOption {
  id: string;
  name: string;
}

export interface CustomFieldDefinition {
  key: string;
  name: string;
  type: string;
  customFieldOptions: CustomFieldOption[];
}

export interface ScreenDefinition {
  customFieldDefinitions: CustomFieldDefinition[];
}

export interface GetIdeaPortalFieldsResponse {
  idea: {
    project: { name: string };
    screenDefinition: ScreenDefinition | null;
  };
}

export interface CreateIdeaCommentResponse {
  createIdeaComment: {
    ideaComment: IdeaComment | null;
    errors: Array<{ message: string }>;
  };
}

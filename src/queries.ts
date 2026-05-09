export const getPageQuery = `
  query GetPage($id: ID!, $includeParent: Boolean!) {
    page(id: $id) {
      name
      description {
        markdownBody
      }
      children {
        name
        referenceNum
      }
      parent @include(if: $includeParent) {
        name
        referenceNum
      }
    }
  }
`;

export const getFeatureQuery = `
  query GetFeature($id: ID!) {
    feature(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const getRequirementQuery = `
  query GetRequirement($id: ID!) {
    requirement(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const searchDocumentsQuery = `
  query SearchDocuments($query: String!, $searchableType: [String!]!) {
    searchDocuments(filters: {query: $query, searchableType: $searchableType}) {
      nodes {
        name
        url
        searchableId
        searchableType
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;

export const searchIdeasQuery = `
  query SearchIdeas($query: String, $projectId: ID) {
    ideas(filters: { query: $query, projectId: $projectId }) {
      nodes {
        id
        referenceNum
        name
        description { htmlBody }
        workflowStatus { name }
        score
        votes
        createdAt
        updatedAt
        project { name referencePrefix }
        tags { name }
        customFieldValues { key value }
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;

export const getIdeaQuery = `
  query GetIdea($id: ID!) {
    idea(id: $id) {
      id
      referenceNum
      name
      description { htmlBody }
      workflowStatus { name }
      score
      votes
      createdAt
      updatedAt
      project { id name referencePrefix }
      tags { name }
      customFieldValues { key value }
    }
  }
`;

export const updateIdeaMutation = `
  mutation UpdateIdea($id: ID!, $idea: IdeaAttributes!) {
    updateIdea(id: $id, idea: $idea) {
      idea {
        id
        referenceNum
        name
        workflowStatus { name }
        tags { name }
        customFieldValues { key value }
      }
      errors { message }
    }
  }
`;

export const getProjectIdeaFieldsQuery = `
  query GetProjectIdeaFields($projectId: ID!) {
    project(id: $projectId) {
      name
      customFieldValues {
        key
        name
        value
      }
    }
  }
`;

export const introspectTypeQuery = `
  query IntrospectType($typeName: String!) {
    __type(name: $typeName) {
      name
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

export const createIdeaCommentMutation = `
  mutation CreateIdeaComment($ideaId: ID!, $body: String!) {
    createIdeaComment(ideaId: $ideaId, ideaComment: { body: $body }) {
      ideaComment {
        id
        body
        createdAt
      }
      errors { message }
    }
  }
`;

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
  query SearchIdeas($query: String) {
    ideas(filters: { query: $query }) {
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
        url
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
      url
      project { name referencePrefix }
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

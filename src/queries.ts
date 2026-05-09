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
        contributorship {
          ... on IdeaUser { id name email }
          ... on User { id name email }
        }
        assignedToUser { id name email }
        tags { name }
        ideaCategories { name }
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
      contributorship {
        ... on IdeaUser { id name email }
        ... on User { id name email }
      }
      assignedToUser { id name email }
      tags { name }
      ideaCategories { name }
      customFieldValues { key value }
      screenDefinition {
        customFieldDefinitions {
          key
          name
          type
          customFieldOptions { id name }
        }
      }
    }
  }
`;

export const updateIdeaMutation = `
  mutation UpdateIdea($id: ID!, $attributes: IdeaAttributes!) {
    updateIdea(id: $id, attributes: $attributes) {
      idea {
        id
        referenceNum
        name
        workflowStatus { name }
        tags { name }
        customFieldValues { key value }
      }
      errors { attributes { name messages } }
    }
  }
`;

export const getIdeaPortalFieldsQuery = `
  query GetIdeaPortalFields($id: ID!) {
    idea(id: $id) {
      project { name }
      screenDefinition {
        customFieldDefinitions {
          key
          name
          type
          customFieldOptions { id name }
        }
      }
    }
  }
`;

export const introspectTypeQuery = `
  query IntrospectType($typeName: String!) {
    __type(name: $typeName) {
      name
      kind
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
      inputFields {
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
      possibleTypes {
        name
        kind
      }
    }
  }
`;

export const getProjectMetadataQuery = `
  query GetProjectMetadata($projectId: ID!) {
    project(id: $projectId) {
      name
      referencePrefix
      ideaCategories {
        id
        name
      }
      ideaWorkflow {
        workflowStatuses {
          id
          name
          internalMeaning
        }
      }
    }
  }
`;

export const setCustomFieldValuesMutation = `
  mutation SetCustomFieldValues($id: ID!, $typename: CustomFieldableTypeEnum!, $customFieldValues: [CustomFieldValueInput!]!) {
    setCustomFieldValues(attributes: { record: { id: $id, typename: $typename }, customFieldValues: $customFieldValues }) {
      customFieldValues {
        key
        value
      }
      errors { attributes { name messages } }
    }
  }
`;

export const createIdeaCommentMutation = `
  mutation CreateComment($id: ID!, $typename: CommentableTypeEnum!, $body: String!) {
    createComment(attributes: { commentable: { id: $id, typename: $typename }, body: $body }) {
      comment {
        id
        body
        createdAt
      }
      errors { attributes { name messages } }
    }
  }
`;

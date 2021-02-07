/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDocument = /* GraphQL */ `
  query GetDocument($id: ID!) {
    getDocument(id: $id) {
      id
      document
      createdAt
      updatedAt
    }
  }
`;
export const listDocuments = /* GraphQL */ `
  query ListDocuments(
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDocuments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        document
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getOperation = /* GraphQL */ `
  query GetOperation($id: ID!) {
    getOperation(id: $id) {
      id
      editorId
      op
      createdAt
      updatedAt
    }
  }
`;
export const listOperations = /* GraphQL */ `
  query ListOperations(
    $filter: ModelOperationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOperations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        editorId
        op
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

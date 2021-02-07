/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDocument = /* GraphQL */ `
  mutation CreateDocument(
    $input: CreateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    createDocument(input: $input, condition: $condition) {
      id
      document
      createdAt
      updatedAt
    }
  }
`;
export const updateDocument = /* GraphQL */ `
  mutation UpdateDocument(
    $input: UpdateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    updateDocument(input: $input, condition: $condition) {
      id
      document
      createdAt
      updatedAt
    }
  }
`;
export const deleteDocument = /* GraphQL */ `
  mutation DeleteDocument(
    $input: DeleteDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    deleteDocument(input: $input, condition: $condition) {
      id
      document
      createdAt
      updatedAt
    }
  }
`;
export const createOperation = /* GraphQL */ `
  mutation CreateOperation(
    $input: CreateOperationInput!
    $condition: ModelOperationConditionInput
  ) {
    createOperation(input: $input, condition: $condition) {
      id
      editorId
      op
      createdAt
      updatedAt
    }
  }
`;
export const updateOperation = /* GraphQL */ `
  mutation UpdateOperation(
    $input: UpdateOperationInput!
    $condition: ModelOperationConditionInput
  ) {
    updateOperation(input: $input, condition: $condition) {
      id
      editorId
      op
      createdAt
      updatedAt
    }
  }
`;
export const deleteOperation = /* GraphQL */ `
  mutation DeleteOperation(
    $input: DeleteOperationInput!
    $condition: ModelOperationConditionInput
  ) {
    deleteOperation(input: $input, condition: $condition) {
      id
      editorId
      op
      createdAt
      updatedAt
    }
  }
`;

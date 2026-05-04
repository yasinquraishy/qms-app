/**
 * Frontend audit field labels — mirrors backend/shared/constants/auditFieldLabels.js.
 * Map: entityType → { camelCaseField: 'Friendly Label' }
 * Used by AuditLogsDiffViewer to render diffs with human-readable field names.
 * Keys are camelCase — handlers call keysToCamelCase() on payload rows before storing.
 */
export const AUDIT_FIELD_LABELS = {
  Document: {
    docNumber: 'Document Number',
    title: 'Title',
    statusId: 'Status',
    departmentId: 'Department',
    documentTypeId: 'Document Type',
    templateId: 'Template',
    effectiveDate: 'Effective Date',
    versionMajor: 'Version Major',
    versionMinor: 'Version Minor',
  },
  DocumentVersion: {
    versionMajor: 'Version Major',
    versionMinor: 'Version Minor',
    statusId: 'Status',
    effectiveDate: 'Effective Date',
  },
  DocumentTemplate: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
    documentTypeId: 'Document Type',
  },
  Workflow: {
    name: 'Workflow Name',
    statusId: 'Status',
  },
  WorkflowInstance: {
    workflowId: 'Workflow',
    statusId: 'Status',
    resourceType: 'Resource Type',
    resourceId: 'Resource ID',
  },
  FormTemplate: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
    documentTypeId: 'Document Type',
  },
  Supplier: {
    name: 'Supplier Name',
    statusId: 'Status',
    qualificationStatus: 'Qualification Status',
    expiryDate: 'Expiry Date',
  },
  SupplierDocument: {
    title: 'Title',
    statusId: 'Status',
    expiryDate: 'Expiry Date',
  },
  AssetRequest: {
    title: 'Title',
    statusId: 'Status',
    requestedById: 'Requested By',
    dueDate: 'Due Date',
  },
  Nonconformance: {
    title: 'Title',
    statusId: 'Status',
    typeId: 'Type',
    severityId: 'Severity',
    sourceId: 'Source',
  },
  User: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    userStatusId: 'Status',
    jobTitle: 'Job Title',
    departmentId: 'Department',
    siteId: 'Site',
  },
  Team: {
    name: 'Team Name',
    statusId: 'Status',
    departmentId: 'Department',
  },
  Department: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
  },
  Site: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
  },
  Product: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
    productTypeId: 'Product Type',
  },
  TaskInstance: {
    title: 'Title',
    statusId: 'Status',
    assigneeId: 'Assigned To',
    dueDate: 'Due Date',
    priority: 'Priority',
  },
  OptionSet: {
    name: 'Name',
    code: 'Code',
    statusId: 'Status',
  },
  ApiKey: {
    label: 'Label',
    stateId: 'State',
  },
  Company: {
    name: 'Company Name',
    statusId: 'Status',
  },
}

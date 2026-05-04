/**
 * Frontend audit log constants — mirrors backend/shared/constants/auditActions.js.
 * Keep in sync when adding new action codes.
 */

export const AUDIT_ACTIONS = {
  // Generic CRUD
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',

  // Status transitions
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE',

  // Document-specific
  DRAFT: 'DRAFT',
  SUBMIT_FOR_REVIEW: 'SUBMIT_FOR_REVIEW',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  OBSOLETE: 'OBSOLETE',

  // Workflow-specific
  INITIATE: 'INITIATE',
  STEP_PENDING: 'STEP_PENDING',
  STEP_APPROVED: 'STEP_APPROVED',
  STEP_REJECTED: 'STEP_REJECTED',
  USER_APPROVED: 'USER_APPROVED',
  USER_REJECTED: 'USER_REJECTED',
  COMPLETE: 'COMPLETE',
  REASSIGN: 'REASSIGN',

  // Supplier-specific
  BLOCK: 'BLOCK',
  REQUALIFY: 'REQUALIFY',
  SHARE_DOC: 'SHARE_DOC',

  // User/Access
  INVITE: 'INVITE',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  REVOKE_ROLE: 'REVOKE_ROLE',
  ASSIGN_TEAM: 'ASSIGN_TEAM',

  // NC-specific
  INVESTIGATE: 'INVESTIGATE',
  DISPOSITION: 'DISPOSITION',
  CLOSE: 'CLOSE',
  REOPEN: 'REOPEN',

  // Misc
  PUBLISH: 'PUBLISH',
  LOCK: 'LOCK',
  ROTATE: 'ROTATE',
  CANCEL: 'CANCEL',
}

export const ACTION_COLORS = {
  CREATE: 'tw:bg-green-100 tw:text-green-700',
  ACTIVATE: 'tw:bg-green-100 tw:text-green-700',
  RESTORE: 'tw:bg-green-100 tw:text-green-700',
  REQUALIFY: 'tw:bg-green-100 tw:text-green-700',
  APPROVE: 'tw:bg-emerald-100 tw:text-emerald-700',
  COMPLETE: 'tw:bg-emerald-100 tw:text-emerald-700',
  STEP_APPROVED: 'tw:bg-emerald-100 tw:text-emerald-700',
  USER_APPROVED: 'tw:bg-emerald-100 tw:text-emerald-700',
  REJECT: 'tw:bg-red-100 tw:text-red-700',
  BLOCK: 'tw:bg-red-100 tw:text-red-700',
  STEP_REJECTED: 'tw:bg-red-100 tw:text-red-700',
  USER_REJECTED: 'tw:bg-red-100 tw:text-red-700',
  DELETE: 'tw:bg-red-100 tw:text-red-700',
  SUBMIT_FOR_REVIEW: 'tw:bg-blue-100 tw:text-blue-700',
  INITIATE: 'tw:bg-blue-100 tw:text-blue-700',
  INVITE: 'tw:bg-indigo-100 tw:text-indigo-700',
  ASSIGN_ROLE: 'tw:bg-indigo-100 tw:text-indigo-700',
  ARCHIVE: 'tw:bg-gray-100 tw:text-gray-700',
  DEACTIVATE: 'tw:bg-gray-100 tw:text-gray-700',
  CANCEL: 'tw:bg-gray-100 tw:text-gray-700',
  OBSOLETE: 'tw:bg-gray-100 tw:text-gray-700',
  UPDATE: 'tw:bg-slate-100 tw:text-slate-700',
  DRAFT: 'tw:bg-slate-100 tw:text-slate-700',
}

export const ACTION_ICONS = {
  CREATE: 'IconCirclePlus',
  UPDATE: 'IconEdit',
  DELETE: 'IconTrash',
  ACTIVATE: 'IconCircleCheck',
  DEACTIVATE: 'IconCircleMinus',
  APPROVE: 'IconCircleCheck',
  REJECT: 'IconCircleX',
  ARCHIVE: 'IconArchive',
  INVITE: 'IconMail',
  SUBMIT_FOR_REVIEW: 'IconSend',
  DRAFT: 'IconEdit',
  PUBLISH: 'IconCircleCheck',
  COMPLETE: 'IconCircleCheck',
  BLOCK: 'IconBan',
  ROTATE: 'IconRefresh',
  CANCEL: 'IconBan',
  CLOSE: 'IconLock',
  REOPEN: 'IconLockOpen',
}

export const MODULE_OPTIONS = [
  { label: 'Document Control', value: 'DOCUMENT_CONTROL' },
  { label: 'Workflows', value: 'WORKFLOWS' },
  { label: 'Forms & Records', value: 'FORMS' },
  { label: 'Suppliers', value: 'SUPPLIERS' },
  { label: 'Asset Requests', value: 'ASSET_REQUESTS' },
  { label: 'Nonconformances', value: 'NONCONFORMANCES' },
  { label: 'Users & Access', value: 'USERS_ACCESS' },
  { label: 'Teams', value: 'TEAMS' },
  { label: 'Org / Departments', value: 'ORG' },
  { label: 'Products', value: 'PRODUCTS' },
  { label: 'Tasks', value: 'TASKS' },
  { label: 'Configuration', value: 'CONFIGURATION' },
  { label: 'Organization', value: 'ORGANIZATION' },
  { label: 'API Keys', value: 'API_KEYS' },
]

export const MODULE_META = {
  DOCUMENT_CONTROL: { label: 'Document Control', icon: 'IconFileText', color: 'tw:text-blue-600' },
  WORKFLOWS: { label: 'Workflows', icon: 'IconGitBranch', color: 'tw:text-purple-600' },
  FORMS: { label: 'Forms & Records', icon: 'IconClipboardList', color: 'tw:text-cyan-600' },
  SUPPLIERS: { label: 'Suppliers', icon: 'IconTruck', color: 'tw:text-orange-600' },
  ASSET_REQUESTS: { label: 'Asset Requests', icon: 'IconPackage', color: 'tw:text-amber-600' },
  NONCONFORMANCES: {
    label: 'Nonconformances',
    icon: 'IconAlertTriangle',
    color: 'tw:text-red-600',
  },
  USERS_ACCESS: { label: 'Users & Access', icon: 'IconUsers', color: 'tw:text-indigo-600' },
  TEAMS: { label: 'Teams', icon: 'IconUsersGroup', color: 'tw:text-teal-600' },
  ORG: { label: 'Org / Departments', icon: 'IconBuilding', color: 'tw:text-slate-600' },
  PRODUCTS: { label: 'Products', icon: 'IconBox', color: 'tw:text-lime-600' },
  TASKS: { label: 'Tasks', icon: 'IconChecklist', color: 'tw:text-pink-600' },
  CONFIGURATION: { label: 'Configuration', icon: 'IconSettings', color: 'tw:text-gray-600' },
  ORGANIZATION: { label: 'Organization', icon: 'IconBuildingEstate', color: 'tw:text-slate-600' },
  API_KEYS: { label: 'API Keys', icon: 'IconKey', color: 'tw:text-yellow-600' },
  OTHER: { label: 'Other', icon: 'IconDots', color: 'tw:text-gray-500' },
}

/**
 * Maps entity type → async (entityId, db) => string.
 * Each resolver fetches the entity (and any parent FK) from IDB and returns a human-readable label.
 * Falls back to entityId if the record is not found in IDB.
 */
export const ENTITY_LABEL_RESOLVERS = {
  async Document(id, db) {
    const e = await db.Document.findByPk(id)
    return e ? e.docNumber || e.title || id : id
  },

  async DocumentVersion(id, db) {
    const dv = await db.DocumentVersion.findByPk(id)
    if (!dv) return id
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    return doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
  },

  async DocumentTemplate(id, db) {
    const e = await db.DocumentTemplate.findByPk(id)
    return e ? e.name || id : id
  },

  async DocumentSection(id, db) {
    const e = await db.DocumentSection.findByPk(id)
    return e ? e.title || id : id
  },

  async DocumentLink(id, db) {
    const e = await db.DocumentLink.findByPk(id)
    if (!e) return id
    const dv = await db.DocumentVersion.findByPk(e.fromDocumentVersionId)
    if (!dv) return id
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    return doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
  },

  async Workflow(id, db) {
    const e = await db.Workflow.findByPk(id)
    return e ? e.name || id : id
  },

  async WorkflowVersion(id, db) {
    const wv = await db.WorkflowVersion.findByPk(id)
    if (!wv) return id
    const workflow = await db.Workflow.findByPk(wv.workflowId)
    const vLabel = wv.versionLabel || `${wv.versionMajor}.${wv.versionMinor}`
    return workflow ? `${workflow.name} v${vLabel}` : `v${vLabel}`
  },

  async WorkflowInstance(id, db) {
    const wi = await db.WorkflowInstance.findByPk(id)
    if (!wi) return id
    const wv = await db.WorkflowVersion.findByPk(wi.workflowVersionId)
    if (!wv) return id
    const workflow = await db.Workflow.findByPk(wv.workflowId)
    return workflow ? workflow.name : id
  },

  async WorkflowInstanceStep(id, db) {
    const e = await db.WorkflowInstanceStep.findByPk(id)
    return e ? `Step ${e.stepNumber}` : id
  },

  async FormTemplate(id, db) {
    const e = await db.FormTemplate.findByPk(id)
    return e ? e.title || e.code || id : id
  },

  async Record(id, db) {
    const e = await db.Record.findByPk(id)
    return e ? e.recordNumber || id : id
  },

  async Supplier(id, db) {
    const e = await db.Supplier.findByPk(id)
    return e ? e.name || id : id
  },

  async SupplierDocument(id, db) {
    const sd = await db.SupplierDocument.findByPk(id)
    if (!sd) return id
    const dv = await db.DocumentVersion.findByPk(sd.documentVersionId)
    if (!dv) return id
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    return doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
  },

  async SupplierAsset(id, db) {
    const e = await db.SupplierAsset.findByPk(id)
    return e ? id : id
  },

  async SupplierContact(id, db) {
    const e = await db.SupplierContact.findByPk(id)
    return e ? e.email || id : id
  },

  async AssetRequest(id, db) {
    const e = await db.AssetRequest.findByPk(id)
    return e ? e.title || id : id
  },

  async Nonconformance(id, db) {
    const e = await db.Nonconformance.findByPk(id)
    return e ? e.ncNumber || e.title || id : id
  },

  async User(id, db) {
    const e = await db.User.findByPk(id)
    if (!e) return id
    return `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email || id
  },

  async Role(id, db) {
    const e = await db.Role.findByPk(id)
    return e ? e.name || id : id
  },

  async Team(id, db) {
    const e = await db.Team.findByPk(id)
    return e ? e.name || id : id
  },

  async Department(id, db) {
    const e = await db.Department.findByPk(id)
    return e ? e.name || e.code || id : id
  },

  async Site(id, db) {
    const e = await db.Site.findByPk(id)
    return e ? e.name || e.code || id : id
  },

  async Product(id, db) {
    const e = await db.Product.findByPk(id)
    return e ? e.name || e.sku || id : id
  },

  async TaskInstance(id, db) {
    const e = await db.TaskInstance.findByPk(id)
    return e ? id : id
  },

  async OptionSet(id, db) {
    const e = await db.OptionSet.findByPk(id)
    return e ? e.name || id : id
  },

  async ApiKey(id, db) {
    const e = await db.ApiKey.findByPk(id)
    return e ? e.name || e.label || id : id
  },
}

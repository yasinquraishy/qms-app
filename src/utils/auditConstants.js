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
 * Maps entity type (singular) → async (entityId, db) => { label, displayType, displayId }.
 * Child entity resolvers chain to their logical parent via `this`.
 * Must be called as ENTITY_LABEL_RESOLVERS[type].call(ENTITY_LABEL_RESOLVERS, id, db).
 */
export const ENTITY_LABEL_RESOLVERS = {
  async Document(id, db) {
    const e = await db.Document.findByPk(id)
    return { label: e ? e.docNumber || e.title || id : id, displayType: 'Document', displayId: id }
  },

  async DocumentVersion(id, db) {
    const dv = await db.DocumentVersion.findByPk(id)
    if (!dv) return { label: id, displayType: 'DocumentVersion', displayId: id }
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    const label = doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
    return { label, displayType: 'DocumentVersion', displayId: id }
  },

  async DocumentTemplate(id, db) {
    const e = await db.DocumentTemplate.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'DocumentTemplate', displayId: id }
  },

  async DocumentSection(id, db) {
    const e = await db.DocumentSection.findByPk(id)
    return { label: e ? e.title || id : id, displayType: 'DocumentSection', displayId: id }
  },

  async DocumentLink(id, db) {
    const e = await db.DocumentLink.findByPk(id)
    if (!e) return { label: id, displayType: 'DocumentLink', displayId: id }
    const dv = await db.DocumentVersion.findByPk(e.fromDocumentVersionId)
    if (!dv) return { label: id, displayType: 'DocumentLink', displayId: id }
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    const label = doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
    return { label, displayType: 'DocumentLink', displayId: id }
  },

  async Workflow(id, db) {
    const e = await db.Workflow.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'Workflow', displayId: id }
  },

  async ApprovalWorkflowVersion(id, db) {
    return this.WorkflowVersion(id, db)
  },

  async WorkflowVersion(id, db) {
    const wv = await db.WorkflowVersion.findByPk(id)
    if (!wv) return { label: id, displayType: 'WorkflowVersion', displayId: id }
    const workflow = await db.Workflow.findByPk(wv.workflowId)
    const vLabel = wv.versionLabel || `${wv.versionMajor}.${wv.versionMinor}`
    const label = workflow ? `${workflow.name} v${vLabel}` : `v${vLabel}`
    return { label, displayType: 'WorkflowVersion', displayId: id }
  },

  async WorkflowInstance(id, db) {
    const wi = await db.WorkflowInstance.findByPk(id)
    if (!wi) return { label: id, displayType: 'WorkflowInstance', displayId: id }
    const wv = await db.WorkflowVersion.findByPk(wi.workflowVersionId)
    if (!wv) return { label: id, displayType: 'WorkflowInstance', displayId: id }
    const workflow = await db.Workflow.findByPk(wv.workflowId)
    return { label: workflow ? workflow.name : id, displayType: 'WorkflowInstance', displayId: id }
  },

  async ApprovalWorkflowInstance(id, db) {
    return this.WorkflowInstance(id, db)
  },

  async WorkflowInstanceStep(id, db) {
    const e = await db.WorkflowInstanceStep.findByPk(id)
    return {
      label: e ? `Step ${e.stepNumber}` : id,
      displayType: 'WorkflowInstanceStep',
      displayId: id,
    }
  },

  async ApprovalWorkflowInstanceStep(id, db) {
    const e = await db.WorkflowInstanceStep.findByPk(id)
    return e
      ? this.WorkflowInstance(e.workflowInstanceId, db)
      : { label: id, displayType: 'ApprovalWorkflowInstanceStep', displayId: id }
  },

  async UsersOnApprovalWorkflowInstanceStep(id, db) {
    const e = await db.UserOnWorkflowInstanceStep.findByPk(id)
    return e
      ? this.WorkflowInstanceStep(e.workflowInstanceStepId, db)
      : { label: id, displayType: 'UsersOnApprovalWorkflowInstanceStep', displayId: id }
  },

  async ApprovalWorkflowStep(id, db) {
    return this.WorkflowStep(id, db)
  },

  async WorkflowStep(id, db) {
    const e = await db.WorkflowStep.findByPk(id)
    return e
      ? this.WorkflowVersion(e.workflowVersionId, db)
      : { label: id, displayType: 'WorkflowStep', displayId: id }
  },

  async WorkflowStepRole(id, db) {
    const e = await db.WorkflowStepRole.findByPk(id)
    return e
      ? this.WorkflowStep(e.stepId, db)
      : { label: id, displayType: 'WorkflowStepRole', displayId: id }
  },

  async ApprovalWorkflowStepUser(id, db) {
    return this.WorkflowStepUser(id, db)
  },

  async WorkflowStepUser(id, db) {
    const e = await db.WorkflowStepUser.findByPk(id)
    return e
      ? this.WorkflowStep(e.stepId, db)
      : { label: id, displayType: 'WorkflowStepUser', displayId: id }
  },

  async StepSendBackTarget(id, db) {
    const e = await db.StepSendBackTarget.findByPk(id)
    return e
      ? this.WorkflowStep(e.stepId, db)
      : { label: id, displayType: 'StepSendBackTarget', displayId: id }
  },

  async StepsSendBackTarget(id, db) {
    return this.StepSendBackTarget(id, db)
  },

  async AllowedOutcomeOnStep(id, db) {
    const e = await db.AllowedOutcomeOnStep.findByPk(id)
    return e
      ? this.WorkflowStep(e.stepId, db)
      : { label: id, displayType: 'AllowedOutcomeOnStep', displayId: id }
  },

  async AllowedOutcomesOnStep(id, db) {
    return this.AllowedOutcomeOnStep(id, db)
  },

  async PermissionOnRole(id, db) {
    const e = await db.PermissionOnRole.findByPk(id)
    return e
      ? this.Role(e.roleId, db)
      : { label: id, displayType: 'PermissionOnRole', displayId: id }
  },

  async PermissionsOnRole(id, db) {
    return this.PermissionOnRole(id, db)
  },

  async FormTemplate(id, db) {
    const e = await db.FormTemplate.findByPk(id)
    return { label: e ? e.title || e.code || id : id, displayType: 'FormTemplate', displayId: id }
  },

  async Record(id, db) {
    const e = await db.Record.findByPk(id)
    return { label: e ? e.recordNumber || id : id, displayType: 'Record', displayId: id }
  },

  async Supplier(id, db) {
    const e = await db.Supplier.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'Supplier', displayId: id }
  },

  async SupplierDocument(id, db) {
    const sd = await db.SupplierDocument.findByPk(id)
    if (!sd) return { label: id, displayType: 'SupplierDocument', displayId: id }
    const dv = await db.DocumentVersion.findByPk(sd.documentVersionId)
    if (!dv) return { label: id, displayType: 'SupplierDocument', displayId: id }
    const doc = await db.Document.findByPk(dv.documentId)
    const vLabel = dv.versionLabel || `${dv.versionMajor}.${dv.versionMinor}`
    const label = doc ? `${doc.docNumber || doc.title} v${vLabel}` : `v${vLabel}`
    return { label, displayType: 'SupplierDocument', displayId: id }
  },

  async SupplierAsset(id) {
    return { label: id, displayType: 'SupplierAsset', displayId: id }
  },

  async SupplierContact(id, db) {
    const e = await db.SupplierContact.findByPk(id)
    return { label: e ? e.email || id : id, displayType: 'SupplierContact', displayId: id }
  },

  async AssetRequest(id, db) {
    const e = await db.AssetRequest.findByPk(id)
    return { label: e ? e.title || id : id, displayType: 'AssetRequest', displayId: id }
  },

  async Nonconformance(id, db) {
    const e = await db.Nonconformance.findByPk(id)
    return {
      label: e ? e.ncNumber || e.title || id : id,
      displayType: 'Nonconformance',
      displayId: id,
    }
  },

  async User(id, db) {
    const e = await db.User.findByPk(id)
    if (!e) return { label: id, displayType: 'User', displayId: id }
    const label = `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email || id
    return { label, displayType: 'User', displayId: id }
  },

  async Role(id, db) {
    const e = await db.Role.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'Role', displayId: id }
  },

  async Team(id, db) {
    const e = await db.Team.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'Team', displayId: id }
  },

  async Department(id, db) {
    const e = await db.Department.findByPk(id)
    return { label: e ? e.name || e.code || id : id, displayType: 'Department', displayId: id }
  },

  async Site(id, db) {
    const e = await db.Site.findByPk(id)
    return { label: e ? e.name || e.code || id : id, displayType: 'Site', displayId: id }
  },

  async Product(id, db) {
    const e = await db.Product.findByPk(id)
    return { label: e ? e.name || e.sku || id : id, displayType: 'Product', displayId: id }
  },

  async TaskInstance(id, db) {
    const task = await db.TaskInstance.findByPk(id)
    if (!task) return { label: id, displayType: 'TaskInstance', displayId: id }
    // Chain to the entity this task belongs to for a meaningful label
    const entityResolver = this[task.entityType]
    if (entityResolver) {
      const resolved = await entityResolver.call(this, task.entityId, db)
      return { label: resolved.label, displayType: 'TaskInstance', displayId: id }
    }
    return { label: id, displayType: 'TaskInstance', displayId: id }
  },

  async Task(id, db) {
    return this.TaskInstance(id, db)
  },

  async Signature(id) {
    // No SyncEngine model for Signature — falls back to raw ID
    return { label: id, displayType: 'Signature', displayId: id }
  },

  async UsersOnDocument(id, db) {
    const e = await db.UserOnDocument.findByPk(id)
    return e
      ? this.Document(e.documentId, db)
      : { label: id, displayType: 'UsersOnDocument', displayId: id }
  },

  async RolesOnUser(id, db) {
    const e = await db.RoleOnUser.findByPk(id)
    return e ? this.User(e.userId, db) : { label: id, displayType: 'RolesOnUser', displayId: id }
  },

  async UsersOnTeam(id, db) {
    const e = await db.UserOnTeam.findByPk(id)
    return e ? this.Team(e.teamId, db) : { label: id, displayType: 'UsersOnTeam', displayId: id }
  },

  async OptionSet(id, db) {
    const e = await db.OptionSet.findByPk(id)
    return { label: e ? e.name || id : id, displayType: 'OptionSet', displayId: id }
  },

  async ApiKey(id, db) {
    const e = await db.ApiKey.findByPk(id)
    return { label: e ? e.name || e.label || id : id, displayType: 'ApiKey', displayId: id }
  },
}

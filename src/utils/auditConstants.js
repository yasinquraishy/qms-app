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

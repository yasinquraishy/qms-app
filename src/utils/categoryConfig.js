/**
 * Category configuration for permissions and other entities
 * Centralized metadata for consistent categorization across the app
 */

export const CATEGORY_METADATA = {
  records: {
    label: 'Records & Compliance',
    icon: 'description',
    description: 'Manage access for Records & Compliance',
  },
  formTemplates: {
    label: 'Form Templates',
    icon: 'dynamic_form',
    description: 'Manage access for Form Templates',
  },
  sites: {
    label: 'Sites',
    icon: 'location_on',
    description: 'Manage access for Sites',
  },
  departments: {
    label: 'Departments',
    icon: 'account_tree',
    description: 'Manage access for Departments',
  },
  teams: {
    label: 'Teams',
    icon: 'groups',
    description: 'Manage access for Teams',
  },
  users: {
    label: 'Users',
    icon: 'person',
    description: 'Manage access for Users',
  },
  roles: {
    label: 'Roles',
    icon: 'shield',
    description: 'Manage access for Roles',
  },
  company: {
    label: 'Company',
    icon: 'business',
    description: 'Manage access for Company',
  },
  optionSets: {
    label: 'Option Sets',
    icon: 'list',
    description: 'Manage access for Option Sets',
  },
  documents: {
    label: 'Documents',
    icon: 'description',
    description: 'Manage access for Documents',
  },
  'document-templates': {
    label: 'Document Templates',
    icon: 'description',
    description: 'Manage access for Document Templates',
  },
  approvalWorkflows: {
    label: 'Approval Workflows',
    icon: 'account_tree',
    description: 'Manage access for Approval Workflows',
  },
  suppliers: {
    label: 'Suppliers',
    icon: 'local_shipping',
    description: 'Manage access for Suppliers',
  },
}

export const PERMISSION_SECTIONS = [
  {
    name: 'Company Management',
    categories: [
      'company',
      'users',
      'teams',
      'sites',
      'departments',
      'roles',
      'optionSets',
      'suppliers',
    ],
  },
  {
    name: 'Configuration',
    categories: [
      'formTemplates',
      'records',
      'documents',
      'document-templates',
      'approvalWorkflows',
    ],
  },
]

export const PERMISSION_ACTIONS_ORDER = ['create', 'read', 'update', 'delete', 'manage']

/**
 * Get category label
 * @param {string} category - Category key
 * @returns {string} Display label
 */
export function getCategoryLabel(category) {
  return CATEGORY_METADATA[category]?.label || category
}

/**
 * Get category icon
 * @param {string} category - Category key
 * @returns {string} Material icon name
 */
export function getCategoryIcon(category) {
  return CATEGORY_METADATA[category]?.icon || 'settings'
}

/**
 * Get category description
 * @param {string} category - Category key
 * @returns {string} Description text
 */
export function getCategoryDescription(category) {
  return CATEGORY_METADATA[category]?.description || `Manage access for ${category}`
}

/**
 * Format action label with proper capitalization
 * @param {string} action - Action key (create, read, update, delete)
 * @returns {string} Formatted label
 */
export function formatActionLabel(action) {
  if (!action) return ''
  return `${action.charAt(0).toUpperCase()}${action.slice(1)}`
}

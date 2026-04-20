import {
  IconFileText,
  IconForms,
  IconMapPin,
  IconSitemap,
  IconUsersGroup,
  IconUser,
  IconShield,
  IconBuilding,
  IconList,
  IconTruck,
  IconPackage,
  IconReport,
} from '@tabler/icons-vue'

/**
 * Category configuration for permissions and other entities
 * Centralized metadata for consistent categorization across the app
 */

export const CATEGORY_METADATA = {
  records: {
    label: 'Records & Compliance',
    icon: IconFileText,
    description: 'Manage access for Records & Compliance',
  },
  formTemplates: {
    label: 'Form Templates',
    icon: IconForms,
    description: 'Manage access for Form Templates',
  },
  sites: {
    label: 'Sites',
    icon: IconMapPin,
    description: 'Manage access for Sites',
  },
  departments: {
    label: 'Departments',
    icon: IconSitemap,
    description: 'Manage access for Departments',
  },
  teams: {
    label: 'Teams',
    icon: IconUsersGroup,
    description: 'Manage access for Teams',
  },
  users: {
    label: 'Users',
    icon: IconUser,
    description: 'Manage access for Users',
  },
  roles: {
    label: 'Roles',
    icon: IconShield,
    description: 'Manage access for Roles',
  },
  company: {
    label: 'Company',
    icon: IconBuilding,
    description: 'Manage access for Company',
  },
  optionSets: {
    label: 'Option Sets',
    icon: IconList,
    description: 'Manage access for Option Sets',
  },
  documents: {
    label: 'Documents',
    icon: IconFileText,
    description: 'Manage access for Documents',
  },
  'document-templates': {
    label: 'Document Templates',
    icon: IconFileText,
    description: 'Manage access for Document Templates',
  },
  approvalWorkflows: {
    label: 'Approval Workflows',
    icon: IconSitemap,
    description: 'Manage access for Approval Workflows',
  },
  suppliers: {
    label: 'Suppliers',
    icon: IconTruck,
    description: 'Manage access for Suppliers',
  },
  products: {
    label: 'Products',
    icon: IconPackage,
    description: 'Manage access for Products',
  },
  nc_records: {
    label: 'NC Records',
    icon: IconReport,
    description: 'Manage access for Non-Conformance Records',
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
      'products',
      'nc_records',
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
  return CATEGORY_METADATA[category]?.icon || IconList
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

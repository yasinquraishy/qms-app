import { PERMISSION_SECTIONS, PERMISSION_ACTIONS_ORDER } from '@/utils/categoryConfig.js'
import { get } from '@/api'

/**
 * Composable for managing role permissions
 * Handles fetching, grouping, filtering, and selection of permissions
 */
export function useRolePermissions() {
  const permissions = ref([])
  const selectedPermissions = ref([])
  const searchTerm = ref('')
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch all permissions from the API
   */
  async function fetchPermissions() {
    error.value = null

    const data = await get('/v1/services/permissions', {
      loader: loading,
    })
    permissions.value = data.permissions || []
  }

  /**
   * Group permissions by category
   */
  const permissionGroups = computed(() => {
    const groups = {}

    permissions.value.forEach((permission) => {
      const [category, action] = permission.id.split(':')

      if (!groups[category]) {
        groups[category] = {
          name: category,
          permissions: [],
        }
      }

      groups[category].permissions.push({
        ...permission,
        action,
      })
    })

    return groups
  })

  /**
   * Get all unique permission actions in preferred order
   */
  const permissionActions = computed(() => {
    const actions = new Set()

    permissions.value.forEach((permission) => {
      const action = permission.id.split(':')[1]
      if (action) {
        actions.add(action)
      }
    })

    const ordered = []

    PERMISSION_ACTIONS_ORDER.forEach((action) => {
      if (actions.has(action)) {
        ordered.push(action)
        actions.delete(action)
      }
    })

    return [...ordered, ...actions]
  })

  /**
   * Filter permissions by search term
   */
  const filteredGroups = computed(() => {
    if (!searchTerm.value.trim()) {
      return permissionGroups.value
    }

    const search = searchTerm.value.toLowerCase()
    const filtered = {}

    Object.keys(permissionGroups.value).forEach((category) => {
      const group = permissionGroups.value[category]
      const matchingPerms = group.permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          category.toLowerCase().includes(search),
      )

      if (matchingPerms.length > 0) {
        filtered[category] = {
          ...group,
          permissions: matchingPerms,
        }
      }
    })

    return filtered
  })

  /**
   * Group permissions into sections
   */
  const sectionedGroups = computed(() => {
    const groups = filteredGroups.value
    const result = []

    PERMISSION_SECTIONS.forEach((section) => {
      const items = section.categories
        .filter((key) => groups[key])
        .map((key) => {
          return { key, group: groups[key] }
        })

      if (items.length > 0) {
        result.push({ name: section.name, items })
      }
    })

    return result
  })

  /**
   * Check if a permission is selected
   * @param {Object} permission - Permission object with id
   * @returns {boolean}
   */
  function isSelected(permission) {
    return selectedPermissions.value.includes(permission.id)
  }

  /**
   * Toggle a permission selection
   * @param {Object} permission - Permission object with id
   */
  function togglePermission(permission) {
    const index = selectedPermissions.value.indexOf(permission.id)
    if (index > -1) {
      selectedPermissions.value.splice(index, 1)
    } else {
      selectedPermissions.value.push(permission.id)
    }
  }

  /**
   * Get permission for a specific action in a category
   * @param {Array} categoryPermissions - Array of permissions for a category
   * @param {string} action - Action name (create, read, update, delete)
   * @returns {Object|null}
   */
  function getPermissionForAction(categoryPermissions, action) {
    return categoryPermissions.find((permission) => permission.action === action) || null
  }

  /**
   * Select all available permissions
   */
  function selectAll() {
    const allPermissionIds = permissions.value.map((p) => p.id)
    selectedPermissions.value = [...allPermissionIds]
  }

  /**
   * Clear all selected permissions
   */
  function clearAll() {
    selectedPermissions.value = []
  }

  /**
   * Set selected permissions from an array of permission IDs
   * @param {Array<string>} permissionIds - Array of permission IDs
   */
  function setSelectedPermissions(permissionIds) {
    selectedPermissions.value = [...permissionIds]
  }

  return {
    // State
    permissions,
    selectedPermissions,
    searchTerm,
    loading,
    error,

    // Computed
    permissionGroups,
    permissionActions,
    filteredGroups,
    sectionedGroups,

    // Methods
    fetchPermissions,
    isSelected,
    togglePermission,
    getPermissionForAction,
    selectAll,
    clearAll,
    setSelectedPermissions,
  }
}

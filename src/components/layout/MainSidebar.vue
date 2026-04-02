<script setup>
import { currentCompany } from '@/utils/currentCompany'
import { logoutCurrentSession, currentSession, isAllowed, isAdmin } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useCompanyLocalStorage } from '@/utils/useCompanyLocalStorage'

const drawer = useCompanyLocalStorage('sidebar-drawer', true)
const route = useRoute()

// Check if a route is active (including nested routes)
function isActive(targetPath) {
  if (!targetPath) return false
  const currentPath = route.path

  // Exact match
  if (currentPath === targetPath) return true

  // Nested route match (current path starts with target path)
  // Ensure we match complete path segments (not partial matches)
  const normalizedTarget = targetPath.endsWith('/') ? targetPath : targetPath + '/'
  return currentPath.startsWith(normalizedTarget)
}

// User info from current session
const currentUser = computed(() => {
  if (!currentSession.value) return null

  return {
    fullName:
      `${currentSession.value.firstName || ''} ${currentSession.value.lastName || ''}`.trim(),
    ...currentSession.value,
    jobTitle: currentSession.value.jobTitle || 'User',
  }
})

const logoUrl = computed(() => {
  return currentCompany.value?.companyIconUrl
})

// Navigation items
const navItems = computed(() => {
  return [
    {
      label: 'Templates',
      permissions: ['formTemplates:read'],
      icon: 'dynamic_form',
      to: getCompanyPath('/templates'),
    },
    {
      label: 'Records',
      permissions: ['records:read'],
      icon: 'table_chart',
      to: getCompanyPath('/records'),
    },
    {
      label: 'Documents',
      permissions: ['documents:read'],
      icon: 'description',
      to: getCompanyPath('/documents'),
    },
    {
      label: 'Approval Workflows',
      permissions: ['approvalWorkflows:read'],
      icon: 'sym_o_automation',
      to: getCompanyPath('/approval-workflows'),
    },
    {
      label: 'Workflow Instances',
      permissions: ['documents:read'],
      icon: 'inbox',
      to: getCompanyPath('/workflow-instances'),
    },
    {
      label: 'My Tasks',
      icon: 'task',
      to: getCompanyPath('/task-instances'),
    },
    {
      label: 'Suppliers',
      // permissions: ['suppliers:read'],
      icon: 'local_shipping',
      to: getCompanyPath('/suppliers'),
    },
    {}, // Divider
    {
      label: 'Audit Logs',
      icon: 'policy',
      to: getCompanyPath('/audit-logs'),
    },
    {
      label: 'Settings',
      icon: 'settings',
      children: [
        {
          label: 'General',
          icon: 'tune',
          to: getCompanyPath('/settings'),
        },
        {
          label: 'Document Templates',
          permissions: ['document-templates:read'],
          icon: 'article',
          to: getCompanyPath('/document-templates'),
        },
        {
          label: 'Option Sets',
          icon: 'list_alt',
          to: getCompanyPath('/option-sets'),
        },
        {
          label: 'Sites',
          icon: 'business',
          to: getCompanyPath('/sites'),
        },
        {
          label: 'Departments',
          icon: 'corporate_fare',
          to: getCompanyPath('/departments'),
        },
        {
          label: 'Users',
          permissions: ['users:read'],
          icon: 'people',
          to: getCompanyPath('/users'),
        },
        {
          label: 'Roles',
          permissions: ['roles:read'],
          icon: 'shield',
          to: getCompanyPath('/roles'),
        },
        {
          label: 'Groups',
          permissions: ['teams:read'],
          icon: 'group_work',
          to: getCompanyPath('/groups'),
        },
        {
          label: 'API Keys',
          icon: 'key',
          to: getCompanyPath('/api-keys'),
        },
      ].filter((item) => {
        // If no permissions specified, always show
        if (!item.permissions || item.permissions.length === 0) return true

        return isAllowed(item.permissions)
      }),
    },
    ...(isAdmin.value
      ? [
          {}, // Divider
          {
            label: 'Admin',
            icon: 'admin_panel_settings',
            children: [
              {
                label: 'Impersonate',
                icon: 'supervisor_account',
                to: getCompanyPath('/admin/impersonate'),
              },
            ],
          },
        ]
      : []),
  ].filter((item) => {
    // If no permissions specified, always show
    if (!item.permissions || item.permissions.length === 0) return true

    return isAllowed(item.permissions)
  })
})
</script>

<template>
  <Transition name="mainSidebar">
    <aside
      v-if="drawer"
      class="tw:w-64 tw:border-r tw:border-divider tw:bg-sidebar tw:flex! tw:flex-col tw:justify-between tw:h-screen"
    >
      <div class="tw:flex tw:flex-col tw:gap-4 tw:p-4 tw:flex-1 tw:overflow-hidden">
        <!-- Brand -->
        <div class="tw:flex tw:items-center tw:gap-3">
          <div v-if="logoUrl">
            <img :src="logoUrl" alt="Company Logo" class="tw:w-10 tw:h-10 tw:rounded" />
          </div>
          <div
            v-else
            class="tw:bg-primary tw:flex tw:items-center tw:justify-center tw:rounded-lg tw:size-10 tw:text-white"
          >
            <WIcon icon="sym_o_analytics" size="24px" />
          </div>
          <div class="tw:flex tw:flex-col">
            <div class="tw:text-on-sidebar tw:text-base tw:font-bold tw:leading-tight">
              QMS Admin
            </div>
            <div class="tw:text-secondary tw:text-xs tw:font-medium">Quality Management</div>
          </div>
        </div>

        <!-- Nav Links -->
        <QList tag="nav" class="tw:flex! tw:flex-col tw:gap-1 tw:flex-1 tw:overflow-auto">
          <template v-for="item in navItems" :key="item.label">
            <!-- Parent item with children -->
            <template v-if="item.children">
              <QExpansionItem
                :label="item.label"
                :icon="item.icon"
                defaultOpened
                class="tw:rounded-lg"
                headerClass="tw:px-3 tw:py-2 tw:text-secondary tw:hover:bg-sidebar-hover tw:transition-colors tw:rounded-lg"
              >
                <QList class="tw:ml-3">
                  <QItem
                    v-for="child in item.children"
                    :key="child.label"
                    :to="child.to"
                    :active="isActive(child.to)"
                    clickable
                    class="tw:rounded-lg tw:px-3 tw:py-2 tw:text-secondary tw:hover:bg-sidebar-hover tw:transition-colors"
                    activeClass="tw:bg-main-selected tw:text-primary"
                  >
                    <QItemSection avatar class="tw:min-w-0 tw:pr-3">
                      <WIcon :icon="child.icon" size="20px" />
                    </QItemSection>
                    <QItemSection class="tw:text-sm tw:font-medium">
                      {{ child.label }}
                    </QItemSection>
                  </QItem>
                </QList>
              </QExpansionItem>
            </template>

            <!-- Single item without children -->
            <QItem
              v-else-if="item.to"
              :to="item.to"
              :active="isActive(item.to)"
              clickable
              class="tw:rounded-lg tw:px-3 tw:py-2 tw:text-secondary tw:hover:bg-sidebar-hover tw:transition-colors"
              activeClass="tw:bg-main-selected tw:text-primary!"
            >
              <QItemSection avatar class="tw:min-w-0 tw:pr-3">
                <WIcon :icon="item.icon" size="24px" />
              </QItemSection>
              <QItemSection class="tw:text-sm tw:font-medium">
                {{ item.label }}
              </QItemSection>
            </QItem>

            <!-- Divider -->
            <hr v-else class="tw:border-t tw:border-divider tw:my-2" />
          </template>
        </QList>
      </div>

      <!-- Profile / Bottom -->
      <div class="tw:px-4 tw:py-2 tw:border-t tw:border-divider">
        <div v-if="currentUser" class="tw:flex tw:items-center tw:gap-3">
          <UserAvatar :user="currentUser" class="tw:size-8" />
          <div class="tw:flex tw:flex-col tw:flex-1">
            <div class="tw:text-sm tw:font-bold tw:text-on-sidebar">{{ currentUser.fullName }}</div>
            <div class="tw:text-xs tw:text-secondary">{{ currentUser.jobTitle }}</div>
          </div>
          <WBtn
            flat
            round
            icon="logout"
            size="sm"
            class="tw:text-secondary tw:hover:text-primary"
            @click="logoutCurrentSession"
          />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.mainSidebar-enter-active,
.mainSidebar-leave-active {
  transition: width 0.3s ease;
  overflow: hidden;
}

.mainSidebar-enter-from,
.mainSidebar-leave-to {
  width: 0;
}
</style>

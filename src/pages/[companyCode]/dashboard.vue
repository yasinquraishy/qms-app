<script setup>
import { provideUsers } from '@/composables/useUsers.js'

defineOptions({
  name: 'CompanyDashboard',
})

const route = useRoute()
const companyCode = computed(() => route.params.companyCode)

// Onboarding dialog
const showOnboarding = ref(route.query.onboarding === 'true')
provideUsers()

// Stats data
const stats = ref([
  { title: 'Total Audits', value: '124', trend: 12, icon: 'fact_check', color: 'primary' },
  { title: 'Open Issues', value: '18', trend: -8, icon: 'error_outline', color: 'warning' },
  { title: 'Completed', value: '98', trend: 15, icon: 'check_circle', color: 'positive' },
  { title: 'Overdue', value: '6', trend: -3, icon: 'schedule', color: 'negative' },
])

// Compliance score
const complianceScore = ref(87)

// Recent audits
const recentAudits = ref([
  {
    id: 1,
    title: 'ISO 9001 Internal Audit',
    department: 'Production',
    date: 'Jan 20, 2026',
    status: 'Completed',
  },
  {
    id: 2,
    title: 'Safety Compliance Review',
    department: 'Operations',
    date: 'Jan 18, 2026',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Supplier Quality Assessment',
    department: 'Procurement',
    date: 'Jan 15, 2026',
    status: 'Pending',
  },
  {
    id: 4,
    title: 'Process Documentation Audit',
    department: 'Quality',
    date: 'Jan 12, 2026',
    status: 'Completed',
  },
])

// Quick actions
const quickActions = ref([
  { label: 'Create New Audit', icon: 'add_circle', color: 'primary' },
  { label: 'Report an Issue', icon: 'report_problem', color: 'warning' },
  { label: 'View Documents', icon: 'folder', color: 'info' },
  { label: 'Schedule Training', icon: 'school', color: 'positive' },
])

// Pending tasks
const pendingTasks = ref([
  {
    id: 1,
    task: 'Complete CAPA #2024-015',
    assignee: 'John Doe',
    dueDate: 'Jan 25, 2026',
    priority: 'High',
  },
  {
    id: 2,
    task: 'Review Document Changes',
    assignee: 'Jane Smith',
    dueDate: 'Jan 26, 2026',
    priority: 'Medium',
  },
  {
    id: 3,
    task: 'Supplier Audit Follow-up',
    assignee: 'Mike Johnson',
    dueDate: 'Jan 28, 2026',
    priority: 'Low',
  },
  {
    id: 4,
    task: 'Training Assessment',
    assignee: 'Sarah Wilson',
    dueDate: 'Jan 30, 2026',
    priority: 'High',
  },
])

const taskColumns = [
  { name: 'task', label: 'Task', field: 'task', align: 'left' },
  { name: 'assignee', label: 'Assignee', field: 'assignee', align: 'left' },
  { name: 'dueDate', label: 'Due Date', field: 'dueDate', align: 'left' },
  { name: 'priority', label: 'Priority', field: 'priority', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

function getStatusColor(status) {
  const colors = {
    Completed: 'positive',
    'In Progress': 'info',
    Pending: 'warning',
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = {
    Completed: 'check',
    'In Progress': 'hourglass_empty',
    Pending: 'schedule',
  }
  return icons[status] || 'help'
}

function getPriorityColor(priority) {
  const colors = {
    High: 'negative',
    Medium: 'warning',
    Low: 'positive',
  }
  return colors[priority] || 'grey'
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:min-h-screen tw:bg-main tw:p-5">
    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-5">
      <div>
        <div class="tw:text-3xl tw:font-bold tw:text-on-main">Dashboard</div>
        <div class="tw:text-base tw:text-secondary">
          Welcome back! Here's what's happening with {{ companyCode }} today.
        </div>
      </div>
      <div class="tw:flex tw:gap-2">
        <WBtn outline color="grey-7" icon="download" label="Export" noCaps />
        <WBtn color="primary" icon="add" label="New Audit" unelevated noCaps />
      </div>
    </div>

    <WUploader />

    <!-- Stats Cards -->
    <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:lg:grid-cols-4 tw:gap-4 tw:mb-5">
      <div v-for="stat in stats" :key="stat.title">
        <WCard class="stat-card" flat>
          <QCardSection class="tw:p-4">
            <div class="tw:flex tw:items-start tw:justify-between tw:mb-3">
              <div class="stat-icon-wrapper" :class="`bg-${stat.color}-1`">
                <WIcon :icon="stat.icon" :color="stat.color" size="24px" />
              </div>
              <QChip
                :color="stat.trend > 0 ? 'positive' : 'negative'"
                textColor="white"
                size="sm"
                dense
              >
                <WIcon
                  :icon="stat.trend > 0 ? 'arrow_upward' : 'arrow_downward'"
                  size="12px"
                  class="tw:mr-1"
                />
                {{ Math.abs(stat.trend) }}%
              </QChip>
            </div>
            <div class="tw:text-3xl tw:font-bold tw:mb-1 tw:text-on-main">{{ stat.value }}</div>
            <div class="tw:text-sm tw:text-secondary">{{ stat.title }}</div>
          </QCardSection>
        </WCard>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-4">
      <!-- Recent Audits -->
      <div class="tw:lg:col-span-2">
        <WCard flat class="content-card">
          <QCardSection class="tw:flex tw:items-center tw:pb-0">
            <div class="tw:text-lg tw:font-medium tw:text-on-main">Recent Audits</div>
            <QSpace />
            <WBtn flat color="primary" label="View All" noCaps dense />
          </QCardSection>
          <QCardSection>
            <QList class="audit-list" separator>
              <QItem
                v-for="audit in recentAudits"
                :key="audit.id"
                class="audit-item tw:p-4"
                clickable
              >
                <QItemSection avatar>
                  <WAvatar :color="getStatusColor(audit.status)" textColor="white" size="48px">
                    <WIcon :icon="getStatusIcon(audit.status)" size="24px" />
                  </WAvatar>
                </QItemSection>
                <QItemSection>
                  <QItemLabel class="tw:font-medium tw:text-on-main">
                    {{ audit.title }}
                  </QItemLabel>
                  <QItemLabel caption class="tw:text-secondary">
                    <WIcon icon="business" size="14px" class="tw:mr-1" />
                    {{ audit.department }}
                    <span class="tw:mx-2">•</span>
                    <WIcon icon="event" size="14px" class="tw:mr-1" />
                    {{ audit.date }}
                  </QItemLabel>
                </QItemSection>
                <QItemSection side>
                  <QChip :color="getStatusColor(audit.status)" textColor="white" size="sm" outline>
                    {{ audit.status }}
                  </QChip>
                </QItemSection>
                <QItemSection side>
                  <WBtn flat round icon="more_vert" color="grey-6" size="sm" />
                </QItemSection>
              </QItem>
            </QList>
          </QCardSection>
        </WCard>
      </div>

      <!-- Sidebar -->
      <div class="tw:flex tw:flex-col tw:gap-4">
        <!-- Compliance Score -->
        <WCard flat class="content-card">
          <QCardSection>
            <div class="tw:text-lg tw:font-medium tw:text-on-main tw:mb-4">Compliance Score</div>
            <div class="tw:flex tw:justify-center tw:py-2">
              <QCircularProgress
                showValue
                :value="complianceScore"
                size="160px"
                :thickness="0.12"
                color="positive"
                trackColor="grey-3"
              >
                <div class="tw:text-center">
                  <div class="tw:text-4xl tw:font-bold tw:text-good">{{ complianceScore }}%</div>
                  <div class="tw:text-xs tw:text-secondary">Excellent</div>
                </div>
              </QCircularProgress>
            </div>
            <div class="tw:grid tw:grid-cols-3 tw:gap-2 tw:mt-3">
              <div class="tw:text-center">
                <div class="tw:text-xl tw:font-bold tw:text-good">98</div>
                <div class="tw:text-xs tw:text-secondary">Passed</div>
              </div>
              <div class="tw:text-center">
                <div class="tw:text-xl tw:font-bold tw:text-warn">14</div>
                <div class="tw:text-xs tw:text-secondary">Pending</div>
              </div>
              <div class="tw:text-center">
                <div class="tw:text-xl tw:font-bold tw:text-bad">2</div>
                <div class="tw:text-xs tw:text-secondary">Failed</div>
              </div>
            </div>
          </QCardSection>
        </WCard>

        <!-- Quick Actions -->
        <WCard flat class="content-card">
          <QCardSection>
            <div class="tw:text-lg tw:font-medium tw:text-on-main tw:mb-3">Quick Actions</div>
            <div class="tw:flex tw:flex-col tw:gap-2">
              <WBtn
                v-for="action in quickActions"
                :key="action.label"
                class="tw:w-full action-btn"
                :color="action.color"
                :icon="action.icon"
                :label="action.label"
                align="left"
                unelevated
                noCaps
              />
            </div>
          </QCardSection>
        </WCard>
      </div>
    </div>

    <!-- Pending Tasks Table -->
    <WCard flat class="content-card tw:mt-4">
      <QCardSection class="tw:flex tw:items-center tw:pb-0">
        <div class="tw:text-lg tw:font-medium tw:text-on-main">Pending Tasks</div>
        <QSpace />
        <QChip color="warning" textColor="white" size="sm">
          {{ pendingTasks.length }} pending
        </QChip>
      </QCardSection>
      <QCardSection>
        <QTable
          :rows="pendingTasks"
          :columns="taskColumns"
          rowKey="id"
          flat
          hidePagination
          :rowsPerPageOptions="[0]"
          class="tasks-table"
        >
          <template #body-cell-task="props">
            <QTd :props="props">
              <div class="tw:font-medium tw:text-on-main">{{ props.row.task }}</div>
            </QTd>
          </template>
          <template #body-cell-assignee="props">
            <QTd :props="props">
              <div class="tw:flex tw:items-center tw:gap-2">
                <WAvatar size="28px" color="primary" textColor="white">
                  {{ props.row.assignee.charAt(0) }}
                </WAvatar>
                {{ props.row.assignee }}
              </div>
            </QTd>
          </template>
          <template #body-cell-priority="props">
            <QTd :props="props">
              <QChip
                :color="getPriorityColor(props.row.priority)"
                textColor="white"
                size="sm"
                dense
              >
                {{ props.row.priority }}
              </QChip>
            </QTd>
          </template>
          <template #body-cell-actions="props">
            <QTd :props="props">
              <WBtn flat round size="sm" icon="visibility" color="primary" tooltip="View Details" />
              <WBtn flat round size="sm" icon="edit" color="grey-7" tooltip="Edit Task" />
              <WBtn
                flat
                round
                size="sm"
                icon="check_circle"
                color="positive"
                tooltip="Mark Complete"
              />
            </QTd>
          </template>
        </QTable>
      </QCardSection>
    </WCard>

    <iframe
      src="https://docs.google.com/document/d/1PSpwVmyuA8feXB8ZwCbPMH5yoxRhMK0m9Lt8sFJzkI4/edit?tab=t.0"
      height="100vh"
      weidth="100%"
    />
  </div>

  <!-- Onboarding Dialog -->
  <OnboardingDialog v-model="showOnboarding" />
</template>

<style lang="scss" scoped>
.stat-card {
  border: 1px solid var(--divider);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-card {
  border: 1px solid var(--divider);
  border-radius: 12px;
}

.audit-list {
  .audit-item {
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--main-hover);
    }
  }
}

.action-btn {
  padding: 12px 16px;
  border-radius: 8px;
  justify-content: flex-start;

  :deep(.q-btn__content) {
    justify-content: flex-start;
  }
}

.tasks-table {
  :deep(th) {
    font-weight: 600;
    color: var(--secondary);
  }

  :deep(td) {
    padding: 16px 12px;
  }
}
</style>

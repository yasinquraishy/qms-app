<script setup>
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { isAllowed } from '@/utils/currentSession.js'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const { workflows: rows, loading, deleteWorkflow } = useApprovalWorkflows()

const canDeleteWorkflow = computed(() => isAllowed(['approvalWorkflows:delete']))

const columns = [
  { name: 'name', label: 'WORKFLOW NAME', field: 'name', align: 'left', sortable: true },
  { name: 'steps', label: 'STEPS', field: 'steps', align: 'left', sortable: false },
  { name: 'version', label: 'VERSION', field: 'version', align: 'left', sortable: true },
  { name: 'statusId', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

function navigateToWorkflow(row) {
  const path = getCompanyPath(`/approval-workflows/${row.id}`)
  router.push(path)
}

async function handleDelete(workflow) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete workflow "${workflow.name}" (${workflow.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deleteWorkflow(workflow.id)
    if (success) {
      $q.notify({ type: 'positive', message: 'Workflow deleted successfully' })
    } else {
      $q.notify({ type: 'negative', message: 'Failed to delete workflow' })
    }
  })
}
</script>

<template>
  <QCard flat bordered>
    <WTable :rows="rows" :columns="columns" class="tw:flex-1" :loading="loading" hideTop noBorder>
      <!-- Name Column -->
      <template #body-cell-name="slotProps">
        <QTd :props="slotProps">
          <div
            class="tw:flex tw:flex-col tw:cursor-pointer"
            @click="navigateToWorkflow(slotProps.row)"
          >
            <span class="tw:font-bold tw:text-on-main">{{ slotProps.row.name }}</span>
            <span
              v-if="slotProps.row.description"
              class="tw:text-xs tw:text-secondary tw:line-clamp-1"
            >
              {{ slotProps.row.description }}
            </span>
          </div>
        </QTd>
      </template>

      <!-- Steps Column -->
      <template #body-cell-steps="slotProps">
        <QTd :props="slotProps">
          <div class="tw:flex tw:items-center tw:gap-1">
            <WIcon icon="layers" size="16px" class="tw:text-secondary" />
            <span class="tw:text-sm tw:text-secondary">
              {{ slotProps.row.currentVersion?.steps?.length || 0 }} Steps
            </span>
          </div>
        </QTd>
      </template>

      <!-- Version Column -->
      <template #body-cell-version="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary tw:font-mono">
            v{{
              slotProps.row.currentVersion?.versionLabel ||
              `${slotProps.row.currentVersion?.versionMajor}.${slotProps.row.currentVersion?.versionMinor}`
            }}
          </span>
        </QTd>
      </template>

      <!-- Status Column -->
      <template #body-cell-statusId="slotProps">
        <QTd :props="slotProps">
          <WStatusBadge
            :status="slotProps.row.currentVersion?.statusId"
            variant="workflow"
            showDot
          />
        </QTd>
      </template>

      <!-- Created At Column -->
      <template #body-cell-createdAt="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">
            {{ slotProps.row.createdAt.formatDate('date') }}
          </span>
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="slotProps">
        <QTd :props="slotProps">
          <div class="tw:flex tw:justify-end">
            <WBtn flat round dense color="grey-6" icon="more_vert">
              <QMenu>
                <QList dense style="min-width: 160px">
                  <QItem v-close-popup clickable @click="navigateToWorkflow(slotProps.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="edit" size="20px" color="primary" />
                        <div>Edit</div>
                      </div>
                    </QItemSection>
                  </QItem>
                  <QItem
                    v-if="canDeleteWorkflow"
                    v-close-popup
                    clickable
                    class="tw:text-bad"
                    @click="handleDelete(slotProps.row)"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="delete" size="20px" />
                        <div>Delete</div>
                      </div>
                    </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </WBtn>
          </div>
        </QTd>
      </template>
    </WTable>
  </QCard>
</template>

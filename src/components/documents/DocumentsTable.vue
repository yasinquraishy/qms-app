<script setup>
defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
  canArchive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'archive'])

const columns = [
  { name: 'docNumber', label: 'DOC #', field: 'docNumber', align: 'left', sortable: true },
  { name: 'title', label: 'TITLE', field: 'title', align: 'left', sortable: true },
  { name: 'department', label: 'DEPARTMENT', field: 'department', align: 'left', sortable: true },
  { name: 'current', label: 'CURRENT', field: 'current', align: 'left', sortable: false },
  { name: 'latest', label: 'LATEST', field: 'latest', align: 'left', sortable: false },
  { name: 'owner', label: 'OWNER', field: 'owner', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

function getVersionLabel(version) {
  if (!version) return '-'
  return version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
}

function getOwnerName(row) {
  if (!row.user) return '-'
  return `${row.user.firstName} ${row.user.lastName}`.trim()
}
</script>

<template>
  <WCard>
    <WTable :rows="rows" :columns="columns" :loading="loading" class="tw:flex-1" hideTop noBorder>
      <!-- Doc Number Column -->
      <template #body-cell-docNumber="props">
        <QTd :props="props">
          <QBadge color="primary" outline>{{ props.row.docNumber }}</QBadge>
        </QTd>
      </template>

      <!-- Title Column -->
      <template #body-cell-title="props">
        <QTd :props="props">
          <div
            class="tw:font-bold tw:text-on-main tw:cursor-pointer tw:hover:text-primary"
            @click="emit('view', props.row)"
          >
            {{ props.row.title }}
          </div>
        </QTd>
      </template>

      <!-- Department Column -->
      <template #body-cell-department="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">
            {{ props.row.department?.name || '-' }}
          </span>
        </QTd>
      </template>

      <!-- Current Version Column -->
      <template #body-cell-current="props">
        <QTd :props="props">
          <WStatusBadge
            v-if="props.row.currentVersion"
            :version="getVersionLabel(props.row.currentVersion)"
            :status="props.row.currentVersion.statusId"
            variant="document"
            showIcon
          />
          <span v-else class="tw:text-sm tw:text-secondary">-</span>
        </QTd>
      </template>

      <!-- Latest Version Column -->
      <template #body-cell-latest="props">
        <QTd :props="props">
          <WStatusBadge
            v-if="props.row.latestVersion"
            :version="getVersionLabel(props.row.latestVersion)"
            :status="props.row.latestVersion.statusId"
            variant="document"
            showIcon
          />
          <span v-else class="tw:text-sm tw:text-secondary">-</span>
        </QTd>
      </template>

      <!-- Owner Column -->
      <template #body-cell-owner="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">{{ getOwnerName(props.row) }}</span>
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="props">
        <QTd :props="props">
          <div class="tw:flex tw:justify-end">
            <WBtn flat round dense color="grey-6" icon="more_vert">
              <QMenu>
                <QList dense style="min-width: 140px">
                  <QItem v-close-popup clickable @click="emit('view', props.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="visibility" size="20px" color="primary" />
                        <div>View</div>
                      </div>
                    </QItemSection>
                  </QItem>

                  <QItem
                    v-if="canArchive && props.row.statusId !== 'ARCHIVED'"
                    v-close-popup
                    clickable
                    class="tw:text-bad"
                    @click="emit('archive', props.row)"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="inventory_2" size="20px" />
                        <div>Archive</div>
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
  </WCard>
</template>

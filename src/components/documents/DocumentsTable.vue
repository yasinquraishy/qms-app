<script setup>
import { IconDotsVertical, IconEye, IconArchive } from '@tabler/icons-vue'

const props = defineProps({
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

// current EFFECTIVE version for each document
const currentVersionMapById = useLiveQueryWithDeps(
  [() => props.rows.map((row) => row.id)],
  async (db, [ids]) => {
    if (ids.length === 0) return {}
    const versions = await db.DocumentVersion.where(
      '[documentId+statusId]',
      ids.map((id) => [id, 'EFFECTIVE']),
    ).exec()

    const map = {}
    for (const v of versions) map[v.documentId] = v
    return map
  },
  { initial: {} },
)

const latestVersionMapById = useLiveQueryWithDeps(
  [() => props.rows.map((row) => row.id)],
  async (db, [ids]) => {
    if (ids.length === 0) return {}
    const versions = await db.DocumentVersion.where('documentId', ids)
      .where('isLatest', true)
      .exec()

    const map = {}
    for (const v of versions) {
      if (!map[v.documentId] || v.createdAt > map[v.documentId].createdAt) {
        map[v.documentId] = v
      }
    }
    return map
  },
  { initial: {} },
)

const columns = computed(() => [
  { name: 'docNumber', label: 'DOC #', field: 'docNumber', align: 'left', sortable: true },
  { name: 'title', label: 'TITLE', field: 'title', align: 'left', sortable: true },
  { name: 'department', label: 'DEPARTMENT', field: 'departmentId', align: 'left', sortable: true },
  {
    name: 'current',
    label: 'CURRENT',
    field: (row) => currentVersionMapById.value[row.id],
    align: 'left',
    sortable: false,
  },
  {
    name: 'latest',
    label: 'LATEST',
    field: (row) => latestVersionMapById.value[row.id],
    align: 'left',
    sortable: false,
  },
  { name: 'owner', label: 'OWNER', field: 'owner', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
])

function getVersionLabel(version) {
  if (!version) return '-'
  return version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" :loading="loading">
    <!-- Doc Number Column -->
    <template #body-cell-docNumber="{ row }">
      <BaseBadge>{{ row.docNumber }}</BaseBadge>
    </template>

    <!-- Title Column -->
    <template #body-cell-title="{ row }">
      <div
        class="tw:font-bold tw:text-on-main tw:cursor-pointer tw:hover:text-primary"
        @click="emit('view', row)"
      >
        {{ row.title }}
      </div>
    </template>

    <!-- Department Column -->
    <template #body-cell-department="{ row }">
      <DepartmentBadgeById :departmentId="row.departmentId" />
    </template>

    <!-- Current Version Column -->
    <template #body-cell-current="{ value }">
      <DocumentsStatusBadge
        v-if="value"
        :version="getVersionLabel(value)"
        :status="value.statusId"
      />
      <span v-else class="tw:text-sm tw:text-secondary">-</span>
    </template>

    <!-- Latest Version Column -->
    <template #body-cell-latest="{ value }">
      <DocumentsStatusBadge
        v-if="value"
        :version="getVersionLabel(value)"
        :status="value.statusId"
      />
      <span v-else class="tw:text-sm tw:text-secondary">-</span>
    </template>

    <!-- Owner Column -->
    <template #body-cell-owner="{ row }">
      <UserBadgeById :userId="row.userId" />
    </template>

    <!-- Actions Column -->
    <template #body-cell-actions="{ row }">
      <div class="tw:flex tw:justify-end">
        <BasePopover placement="bottom-end" :arrow="false">
          <template #button>
            <button
              class="tw:p-1.5 tw:rounded tw:hover:bg-main-hover tw:text-secondary tw:transition-colors"
            >
              <IconDotsVertical :size="16" />
            </button>
          </template>
          <template #content="{ close }">
            <div class="tw:flex tw:flex-col tw:py-1 tw:min-w-36">
              <button
                class="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:text-sm tw:text-on-sidebar tw:hover:bg-sidebar-hover tw:transition-colors"
                @click="(emit('view', row), close())"
              >
                <IconEye :size="16" class="tw:text-primary" />
                View
              </button>
              <button
                v-if="canArchive && row.statusId !== 'ARCHIVED'"
                class="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:text-sm tw:text-bad tw:hover:bg-sidebar-hover tw:transition-colors"
                @click="(emit('archive', row), close())"
              >
                <IconArchive :size="16" />
                Archive
              </button>
            </div>
          </template>
        </BasePopover>
      </div>
    </template>
  </BaseTable>
</template>

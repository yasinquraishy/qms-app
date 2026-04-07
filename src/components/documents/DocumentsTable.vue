<script setup>
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
  <WCard>
    <WTable :rows="rows" :columns="columns" :loading="loading" class="tw:flex-1" hideTop noBorder>
      <!-- Doc Number Column -->
      <template #body-cell-docNumber="scope">
        <QTd :props="scope">
          <QBadge color="primary" outline>{{ scope.row.docNumber }}</QBadge>
        </QTd>
      </template>

      <!-- Title Column -->
      <template #body-cell-title="scope">
        <QTd :props="scope">
          <div
            class="tw:font-bold tw:text-on-main tw:cursor-pointer tw:hover:text-primary"
            @click="emit('view', scope.row)"
          >
            {{ scope.row.title }}
          </div>
        </QTd>
      </template>

      <!-- Department Column -->
      <template #body-cell-department="scope">
        <QTd :props="scope">
          <DepartmentBadgeById :departmentId="scope.row.departmentId" />
        </QTd>
      </template>

      <!-- Current Version Column -->
      <template #body-cell-current="scope">
        <QTd :props="scope">
          <WStatusBadge
            v-if="scope.value"
            :version="getVersionLabel(scope.value)"
            :status="scope.value.statusId"
            variant="document"
            showIcon
          />
          <span v-else class="tw:text-sm tw:text-secondary">-</span>
        </QTd>
      </template>

      <!-- Latest Version Column -->
      <template #body-cell-latest="scope">
        <QTd :props="scope">
          <WStatusBadge
            v-if="scope.value"
            :version="getVersionLabel(scope.value)"
            :status="scope.value.statusId"
            variant="document"
            showIcon
          />
          <span v-else class="tw:text-sm tw:text-secondary">-</span>
        </QTd>
      </template>

      <!-- Owner Column -->
      <template #body-cell-owner="scope">
        <QTd :props="scope">
          <UserBadgeById :userId="scope.row.userId" />
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="scope">
        <QTd :props="scope">
          <div class="tw:flex tw:justify-end">
            <WBtn flat round dense color="grey-6" icon="more_vert">
              <QMenu>
                <QList dense style="min-width: 140px">
                  <QItem v-close-popup clickable @click="emit('view', scope.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="visibility" size="20px" color="primary" />
                        <div>View</div>
                      </div>
                    </QItemSection>
                  </QItem>

                  <QItem
                    v-if="canArchive && scope.row.statusId !== 'ARCHIVED'"
                    v-close-popup
                    clickable
                    class="tw:text-bad"
                    @click="emit('archive', scope.row)"
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

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

const emit = defineEmits(['view', 'archive', 'unarchive'])

const columns = [
  { name: 'name', label: 'NAME', field: 'name', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  {
    name: 'prefix',
    label: 'PREFIX',
    field: 'prefix',
    align: 'left',
    sortable: true,
  },
  {
    name: 'department',
    label: 'DEPARTMENT',
    field: 'department',
    align: 'left',
    sortable: true,
  },
  {
    name: 'training',
    label: 'TRAINING',
    field: 'trainingAvailable',
    align: 'center',
    sortable: true,
  },
  { name: 'sections', label: 'SECTIONS', field: 'sections', align: 'center' },
  {
    name: 'reviewPeriod',
    label: 'REVIEW PERIOD',
    field: 'periodicReviewMonths',
    align: 'center',
    sortable: true,
  },
  { name: 'created', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

function getSectionCount(row) {
  return row.sections?.length || 0
}
</script>

<template>
  <WCard>
    <WTable :rows="rows" :columns="columns" :loading="loading" class="tw:flex-1" hideTop noBorder>
      <!-- Name Column -->
      <template #body-cell-name="props">
        <QTd :props="props">
          <div
            class="tw:font-bold tw:text-on-main tw:cursor-pointer tw:hover:text-primary"
            @click="emit('view', props.row)"
          >
            {{ props.row.name }}
          </div>
        </QTd>
      </template>

      <!-- Status Column -->
      <template #body-cell-status="props">
        <QTd :props="props">
          <WStatusBadge :status="props.row.statusId" variant="documentTemplate" showDot />
        </QTd>
      </template>

      <!-- Prefix Column -->
      <template #body-cell-prefix="props">
        <QTd :props="props">
          <QBadge color="primary" outline>{{ props.row.prefix }}</QBadge>
        </QTd>
      </template>

      <!-- Department Column -->
      <template #body-cell-department="props">
        <QTd :props="props">
          <span v-if="props.row.department" class="tw:text-sm tw:text-on-main">
            {{ props.row.department.name }}
          </span>
          <span v-else class="tw:text-sm tw:text-gray-400">-</span>
        </QTd>
      </template>

      <!-- Training Column -->
      <template #body-cell-training="props">
        <QTd :props="props">
          <div class="tw:flex tw:justify-center">
            <WIcon
              v-if="props.row.trainingAvailable"
              name="check_circle"
              size="20px"
              class="tw:text-green-600"
            />
            <WIcon v-else name="cancel" size="20px" class="tw:text-gray-400" />
          </div>
        </QTd>
      </template>

      <!-- Sections Column -->
      <template #body-cell-sections="props">
        <QTd :props="props">
          <div class="tw:flex tw:justify-center">
            <QBadge color="grey-6" class="tw:px-3">{{ getSectionCount(props.row) }}</QBadge>
          </div>
        </QTd>
      </template>

      <!-- Review Period Column -->
      <template #body-cell-reviewPeriod="props">
        <QTd :props="props">
          <div class="tw:text-center tw:text-sm tw:text-secondary">
            {{ props.row.periodicReviewMonths }} months
          </div>
        </QTd>
      </template>

      <!-- Created Column -->
      <template #body-cell-created="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">{{
            props.row.createdAt.formatDate('date')
          }}</span>
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
                        <div>View Details</div>
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

                  <QItem
                    v-if="canArchive && props.row.statusId === 'ARCHIVED'"
                    v-close-popup
                    clickable
                    @click="emit('unarchive', props.row)"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="unarchive" size="20px" color="primary" />
                        <div>Unarchive</div>
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

<script setup>
import {
  IconCaretUpFilled,
  IconCaretDownFilled,
  IconChevronLeft,
  IconChevronRight,
  IconTableOff,
} from '@tabler/icons-vue'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: 'id' },
  noDataLabel: { type: String, default: 'No data available' },
})

const pagination = defineModel('pagination', {
  type: Object,
  default: () => ({ page: 1, rowsPerPage: 5, sortBy: null, descending: false }),
})

const sortColumn = computed(() => pagination.value.sortBy ?? null)
const sortDirection = computed(() => (pagination.value.descending ? 'desc' : 'asc'))

function handleSort(col) {
  if (!col.sortable) return
  const newDescending = sortColumn.value === col.name ? !pagination.value.descending : false
  pagination.value = {
    ...pagination.value,
    sortBy: col.name,
    descending: newDescending,
    page: 1,
  }
}

function getCellValue(row, col) {
  if (typeof col.field === 'function') return col.field(row)
  return row[col.field]
}

const sortedRows = computed(() => {
  if (!sortColumn.value) return props.rows
  const col = props.columns.find((c) => c.name === sortColumn.value)
  if (!col || !col.sortable) return props.rows
  return [...props.rows].sort((a, b) => {
    const valA = getCellValue(a, col)
    const valB = getCellValue(b, col)
    if (valA == null && valB == null) return 0
    if (valA == null) return 1
    if (valB == null) return -1
    const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true })
    return sortDirection.value === 'asc' ? cmp : -cmp
  })
})

const paginatedRows = computed(() => {
  const { page, rowsPerPage } = pagination.value
  if (rowsPerPage <= 0) return sortedRows.value
  const start = (page - 1) * rowsPerPage
  return sortedRows.value.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  const rpp = pagination.value.rowsPerPage
  return rpp > 0 ? Math.ceil(props.rows.length / rpp) : 1
})

const paginationLabel = computed(() => {
  const { page, rowsPerPage } = pagination.value
  const total = props.rows.length
  if (total === 0) return '0-0 of 0'
  const start = (page - 1) * rowsPerPage + 1
  const end = Math.min(page * rowsPerPage, total)
  return `${start}-${end} of ${total}`
})

function updatePagination(patch) {
  pagination.value = { ...pagination.value, ...patch }
}

function thAlignClass(align) {
  if (align === 'right') return 'tw:text-right'
  if (align === 'center') return 'tw:text-center'
  return 'tw:text-left'
}

function tdAlignClass(align) {
  if (align === 'right') return 'tw:text-right tw:justify-end'
  if (align === 'center') return 'tw:text-center tw:justify-center'
  return 'tw:text-left tw:justify-start'
}
</script>

<template>
  <div
    class="tw:relative tw:w-full tw:rounded-xl tw:border tw:border-divider tw:bg-sidebar tw:shadow-sm tw:overflow-hidden tw:flex tw:flex-col"
  >
    <!-- Loading bar -->
    <div
      v-if="loading"
      class="tw:absolute tw:top-0 tw:left-0 tw:right-0 tw:h-0.5 tw:overflow-hidden tw:z-10"
    >
      <div class="tw:h-full tw:w-2/5 tw:bg-primary tw:animate-slide" />
    </div>

    <!-- Scrollable container -->
    <div
      class="tw:overflow-x-auto tw:transition-opacity tw:duration-200"
      :class="loading ? 'tw:opacity-50 tw:pointer-events-none' : 'tw:opacity-100'"
    >
      <table class="tw:w-full tw:min-w-125 tw:border-collapse tw:text-sm">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.name"
              :class="[
                'tw:px-4 tw:py-3 tw:text-xs tw:font-bold tw:tracking-widest tw:uppercase tw:whitespace-nowrap tw:select-none tw:border-b tw:border-divider tw:bg-main tw:transition-colors tw:duration-150',
                thAlignClass(col.align),
                col.sortable ? 'tw:cursor-pointer tw:hover:bg-main-hover' : 'tw:cursor-default',
                sortColumn === col.name
                  ? 'tw:text-primary tw:bg-main-selected tw:hover:bg-main-selected'
                  : 'tw:text-secondary',
              ]"
              @click="handleSort(col)"
            >
              <slot :name="'header-cell-' + col.name" :col="col">
                <div
                  class="tw:inline-flex tw:items-center tw:gap-1.5"
                  :class="col.align === 'right' ? 'tw:flex-row-reverse' : ''"
                >
                  <span>{{ col.label }}</span>
                  <span v-if="col.sortable" class="tw:inline-flex tw:flex-col tw:gap-px">
                    <IconCaretUpFilled
                      :size="8"
                      :class="[
                        'tw:transition-opacity tw:duration-150',
                        sortColumn === col.name && sortDirection === 'asc'
                          ? 'tw:opacity-100 tw:text-primary'
                          : 'tw:opacity-25 tw:text-secondary',
                      ]"
                    />
                    <IconCaretDownFilled
                      :size="8"
                      :class="[
                        'tw:transition-opacity tw:duration-150',
                        sortColumn === col.name && sortDirection === 'desc'
                          ? 'tw:opacity-100 tw:text-primary'
                          : 'tw:opacity-25 tw:text-secondary',
                      ]"
                    />
                  </span>
                </div>
              </slot>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedRows.length > 0">
            <tr
              v-for="(row, rowIndex) in paginatedRows"
              :key="row[rowKey] ?? rowIndex"
              class="tw:border-b tw:border-divider last:tw:border-b-0 tw:transition-colors tw:duration-100 tw:hover:bg-sidebar-hover"
            >
              <td
                v-for="col in columns"
                :key="col.name"
                :class="[
                  'tw:px-4 tw:py-3 tw:text-on-main tw:align-middle tw:leading-snug',
                  tdAlignClass(col.align),
                ]"
              >
                <slot
                  v-if="$slots['body-cell-' + col.name]"
                  :name="'body-cell-' + col.name"
                  :row="row"
                  :col="col"
                  :value="getCellValue(row, col)"
                  :rowIndex="rowIndex"
                />
                <slot
                  v-else-if="$slots['body-cell']"
                  name="body-cell"
                  :row="row"
                  :col="col"
                  :value="getCellValue(row, col)"
                  :rowIndex="rowIndex"
                />
                <span v-else class="tw:tabular-nums">
                  {{ getCellValue(row, col) ?? '—' }}
                </span>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td :colspan="columns.length" class="tw:px-4 tw:py-16 tw:text-center">
              <div class="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:text-secondary">
                <IconTableOff :size="40" class="tw:text-placeholder" />
                <span class="tw:text-sm tw:font-medium">{{ noDataLabel }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      class="tw:px-4 tw:py-3 tw:border-t tw:border-divider tw:bg-main tw:flex tw:items-center tw:justify-between sm:tw:justify-end tw:gap-6 tw:text-xs tw:text-secondary"
    >
      <div class="tw:hidden sm:tw:flex tw:items-center tw:gap-2">
        <span>Rows per page:</span>
        <select
          :value="pagination.rowsPerPage"
          class="tw:bg-main tw:border-none tw:cursor-pointer tw:font-medium tw:text-on-main focus:tw:ring-0"
          @change="updatePagination({ rowsPerPage: parseInt($event.target.value), page: 1 })"
        >
          <option v-for="n in [5, 10, 25, 50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="tw:flex tw:items-center tw:gap-4">
        <span class="tw:font-medium tw:text-on-main">{{ paginationLabel }}</span>
        <div class="tw:flex tw:items-center tw:gap-1">
          <button
            :disabled="pagination.page <= 1"
            class="tw:p-1.5 tw:rounded tw:hover:bg-main-hover tw:disabled:opacity-30 tw:disabled:cursor-not-allowed tw:transition-colors"
            @click="updatePagination({ page: pagination.page - 1 })"
          >
            <IconChevronLeft :size="16" />
          </button>
          <button
            :disabled="pagination.page >= totalPages"
            class="tw:p-1.5 tw:rounded tw:hover:bg-main-hover tw:disabled:opacity-30 tw:disabled:cursor-not-allowed tw:transition-colors"
            @click="updatePagination({ page: pagination.page + 1 })"
          >
            <IconChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slide {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(350%);
  }
}

.tw\:animate-slide {
  animation: slide 1.2s ease-in-out infinite;
}
</style>

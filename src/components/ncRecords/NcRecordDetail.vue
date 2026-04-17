<script setup>
import { IconAlertTriangle, IconEdit, IconClock } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const showEditDialog = ref(false)
const activeTab = ref('details')

const canUpdate = computed(() => isAllowed(['nc_records:update']))

const record = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.NcRecord.findByPk(id)
})

const statuses = useLiveQuery((db) => db.NcStatus.where().exec(), { initial: [] })
const severities = useLiveQuery((db) => db.NcSeverity.where().exec(), { initial: [] })
const types = useLiveQuery((db) => db.NcType.where().exec(), { initial: [] })
const sources = useLiveQuery((db) => db.NcSource.where().exec(), { initial: [] })

function getStatus(id) {
  return statuses.value?.find((s) => s.id === id)
}
function getSeverity(id) {
  return severities.value?.find((s) => s.id === id)
}
function getType(id) {
  return types.value?.find((s) => s.id === id)
}
function getSource(id) {
  return sources.value?.find((s) => s.id === id)
}

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'disposition', label: 'Disposition' },
  { key: 'capa', label: 'CAPA' },
  { key: 'attachments', label: 'Attachments' },
  { key: 'history', label: 'History' },
]
</script>

<template>
  <div v-if="record" class="tw:flex tw:flex-col tw:gap-4 tw:h-full tw:p-5">
    <!-- Record Header -->
    <div class="tw:flex tw:items-start tw:justify-between">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <IconAlertTriangle class="tw:size-5" />
        </div>
        <div>
          <div class="tw:flex tw:items-center tw:gap-2">
            <span
              class="tw:inline-flex tw:items-center tw:rounded tw:border tw:border-primary tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:text-primary"
            >
              {{ record.ncNumber }}
            </span>
            <span
              v-if="getStatus(record.statusId)"
              class="tw:inline-flex tw:items-center tw:rounded-full tw:bg-main-hover tw:px-2.5 tw:py-0.5 tw:text-xs tw:font-medium tw:text-secondary"
            >
              {{ getStatus(record.statusId)?.name }}
            </span>
            <span
              v-if="record.isOverdue"
              class="tw:inline-flex tw:items-center tw:gap-1 tw:rounded-full tw:bg-red/10 tw:px-2.5 tw:py-0.5 tw:text-xs tw:font-medium tw:text-red"
            >
              <IconClock class="tw:size-3" />
              Overdue
            </span>
          </div>
          <h1 class="tw:text-xl tw:font-bold tw:text-on-main tw:mt-1">{{ record.title }}</h1>
        </div>
      </div>
      <BaseButton v-if="canUpdate" variant="outline" @click="showEditDialog = true">
        <IconEdit class="tw:size-4" />
        <span>Edit</span>
      </BaseButton>
    </div>

    <!-- Tabs -->
    <div class="tw:flex tw:border-b tw:border-divider tw:gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:transition-colors tw:border-b-2 tw:-mb-px',
          activeTab === tab.key
            ? 'tw:border-primary tw:text-primary'
            : 'tw:border-transparent tw:text-secondary tw:hover:text-on-main',
        ]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tw:flex-1 tw:overflow-auto">
      <!-- Details -->
      <div v-if="activeTab === 'details'" class="tw:grid tw:grid-cols-2 tw:gap-6">
        <div class="tw:flex tw:flex-col tw:gap-4">
          <div v-if="record.description">
            <div
              class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
            >
              Description
            </div>
            <p class="tw:text-sm tw:text-on-main tw:whitespace-pre-wrap">
              {{ record.description }}
            </p>
          </div>
          <div class="tw:grid tw:grid-cols-2 tw:gap-3">
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Severity
              </div>
              <span class="tw:text-sm tw:text-on-main">{{
                getSeverity(record.severityId)?.name ?? '—'
              }}</span>
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Type
              </div>
              <span class="tw:text-sm tw:text-on-main">{{
                getType(record.typeId)?.name ?? '—'
              }}</span>
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Source
              </div>
              <span class="tw:text-sm tw:text-on-main">{{
                getSource(record.sourceId)?.name ?? '—'
              }}</span>
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Detected Date
              </div>
              <span class="tw:text-sm tw:text-on-main">{{
                record.detectedDate ? dt.formatDate(record.detectedDate) : '—'
              }}</span>
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Affected Product
              </div>
              <span class="tw:text-sm tw:text-on-main">{{ record.affectedProduct || '—' }}</span>
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Affected Process
              </div>
              <span class="tw:text-sm tw:text-on-main">{{ record.affectedProcess || '—' }}</span>
            </div>
            <div v-if="record.quantity != null">
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                Quantity
              </div>
              <span class="tw:text-sm tw:text-on-main"
                >{{ record.quantity }} {{ record.quantityUnit }}</span
              >
            </div>
            <div>
              <div
                class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
              >
                SLA Due Date
              </div>
              <span
                :class="[
                  'tw:text-sm',
                  record.isOverdue ? 'tw:text-red tw:font-medium' : 'tw:text-on-main',
                ]"
              >
                {{ record.slaDueDate ? dt.formatDate(record.slaDueDate) : '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Investigation -->
      <div v-else-if="activeTab === 'investigation'" class="tw:flex tw:flex-col tw:gap-4">
        <div v-if="record.investigationNotes">
          <div
            class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
          >
            Investigation Notes
          </div>
          <p class="tw:text-sm tw:text-on-main tw:whitespace-pre-wrap">
            {{ record.investigationNotes }}
          </p>
        </div>
        <div v-if="record.rootCauseNotes">
          <div
            class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
          >
            Root Cause
          </div>
          <p class="tw:text-sm tw:text-on-main tw:whitespace-pre-wrap">
            {{ record.rootCauseNotes }}
          </p>
        </div>
        <div
          v-if="!record.investigationNotes && !record.rootCauseNotes"
          class="tw:text-sm tw:text-secondary"
        >
          No investigation data yet.
        </div>
      </div>

      <!-- Disposition -->
      <div v-else-if="activeTab === 'disposition'" class="tw:flex tw:flex-col tw:gap-4">
        <div v-if="record.dispositionNotes">
          <div
            class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
          >
            Disposition Notes
          </div>
          <p class="tw:text-sm tw:text-on-main tw:whitespace-pre-wrap">
            {{ record.dispositionNotes }}
          </p>
        </div>
        <div v-else class="tw:text-sm tw:text-secondary">No disposition data yet.</div>
      </div>

      <!-- CAPA -->
      <div v-else-if="activeTab === 'capa'" class="tw:flex tw:flex-col tw:gap-4">
        <div v-if="record.capaDescription">
          <div
            class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
          >
            CAPA Description
          </div>
          <p class="tw:text-sm tw:text-on-main tw:whitespace-pre-wrap">
            {{ record.capaDescription }}
          </p>
        </div>
        <div v-if="record.capaDueDate">
          <div
            class="tw:text-xs tw:font-medium tw:text-placeholder tw:uppercase tw:tracking-wider tw:mb-1"
          >
            CAPA Due Date
          </div>
          <span class="tw:text-sm tw:text-on-main">{{ dt.formatDate(record.capaDueDate) }}</span>
        </div>
        <div v-if="!record.capaDescription" class="tw:text-sm tw:text-secondary">
          No CAPA data yet.
        </div>
      </div>

      <!-- Attachments -->
      <div v-else-if="activeTab === 'attachments'" class="tw:text-sm tw:text-secondary">
        Attachments coming soon.
      </div>

      <!-- History -->
      <div v-else-if="activeTab === 'history'">
        <NcRecordTimeline :ncId="record.id" />
      </div>
    </div>
  </div>

  <div v-else class="tw:flex tw:items-center tw:justify-center tw:h-full tw:text-secondary">
    Loading...
  </div>

  <NcRecordCreateUpdateDialog v-if="showEditDialog" :id="id" v-model="showEditDialog" />
</template>

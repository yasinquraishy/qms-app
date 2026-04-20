<script setup>
import { IconRouteSquare2, IconCalendar } from '@tabler/icons-vue'
import { getCompanyPath } from '@/utils/routeHelpers'

defineProps({
  filters: {
    type: Object,
    default: () => ({ search: '', statusId: null }),
  },
})

const router = useRouter()

const rows = useLiveQueryWithDeps(
  [() => null],
  async (db) => {
    const results = await db.NcWorkflowTemplate.where().exec()
    return results.sort((a, b) => {
      const ta = b.createdAt?.toMillis?.() ?? 0
      const tb = a.createdAt?.toMillis?.() ?? 0
      return ta - tb
    })
  },
  { initial: [] },
)

function navigate(template) {
  router.push(getCompanyPath(`/nc-workflow-templates/${template.id}`))
}
</script>

<template>
  <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:lg:grid-cols-3 tw:gap-4">
    <div
      v-for="template in rows"
      :key="template.id"
      class="tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:p-4 tw:cursor-pointer tw:transition-all tw:duration-200 tw:hover:border-primary tw:hover:shadow-md"
      @click="navigate(template)"
    >
      <div class="tw:flex tw:items-center tw:justify-between tw:mb-2">
        <div class="tw:flex tw:items-center tw:gap-3">
          <div
            class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
          >
            <IconRouteSquare2 :size="22" />
          </div>
          <div class="tw:font-bold tw:text-on-main tw:truncate">{{ template.name }}</div>
        </div>
        <NcWorkflowTemplateStatusBadgeById :statusId="template.statusId" />
      </div>

      <div v-if="template.description" class="tw:text-sm tw:text-secondary tw:mb-3 tw:line-clamp-2">
        {{ template.description }}
      </div>

      <div class="tw:flex tw:items-center tw:gap-4 tw:text-xs tw:text-secondary">
        <span class="tw:flex tw:items-center tw:gap-1">
          <IconCalendar :size="16" />
          {{ template.createdAt?.formatDate('date') }}
        </span>
      </div>
    </div>

    <BaseEmptyState v-if="rows.length === 0" title="No templates found" />
  </div>
</template>

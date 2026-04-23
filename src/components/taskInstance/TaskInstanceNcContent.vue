<script setup>
defineProps({
  nc: { type: Object, default: null },
  reviewMode: { type: Boolean, default: false },
})
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main tw:overflow-y-auto">
    <div class="tw:max-w-4xl tw:mx-auto tw:p-6 tw:lg:p-8 tw:space-y-6">
      <!-- Header card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
        <div class="tw:flex tw:items-start tw:justify-between tw:gap-4">
          <div class="tw:space-y-2">
            <div class="tw:flex tw:items-center tw:gap-2">
              <span
                class="tw:text-xs tw:font-semibold tw:bg-primary/10 tw:text-primary tw:px-2 tw:py-0.5 tw:rounded"
              >
                Nonconformance
              </span>
              <span v-if="nc?.ncNumber" class="tw:text-sm tw:text-secondary tw:font-mono">
                #{{ nc.ncNumber }}
              </span>
            </div>
            <h1 class="tw:text-2xl tw:font-bold tw:text-on-main tw:leading-tight">
              {{ nc?.title || '—' }}
            </h1>
          </div>

          <div v-if="reviewMode">
            <BaseBadge class="tw:bg-amber-100 tw:text-amber-700 tw:text-xs tw:font-semibold">
              Pending your review
            </BaseBadge>
          </div>
        </div>

        <p v-if="nc?.description" class="tw:mt-4 tw:text-sm tw:text-secondary tw:leading-relaxed">
          {{ nc.description }}
        </p>
      </div>

      <!-- Details card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
        <div
          class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
        >
          NC Details
        </div>

        <div class="tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:gap-4">
          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Severity</span>
            <NcSeverityBadgeById v-if="nc?.severityId" :severityId="nc.severityId" />
            <span v-else class="tw:text-sm tw:text-secondary">—</span>
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Type</span>
            <NcTypeBadgeById v-if="nc?.typeId" :typeId="nc.typeId" />
            <span v-else class="tw:text-sm tw:text-secondary">—</span>
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Source</span>
            <NcSourceBadgeById v-if="nc?.sourceId" :sourceId="nc.sourceId" />
            <span v-else class="tw:text-sm tw:text-secondary">—</span>
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Detected</span>
            <span class="tw:text-sm tw:font-medium">
              {{ nc?.detectedAt ? nc.detectedAt.formatDate('date') : '—' }}
            </span>
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Owner</span>
            <UserBadgeById v-if="nc?.ownerId" :userId="nc.ownerId" />
            <span v-else class="tw:text-sm tw:text-secondary">—</span>
          </div>

          <div v-if="nc?.qtyAffected" class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary">Qty affected</span>
            <span class="tw:text-sm tw:font-medium">
              {{ nc.qtyAffected }}{{ nc.unitOfMeasure ? ` ${nc.unitOfMeasure}` : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Investigation card (if populated) -->
      <div
        v-if="nc?.rootCause || nc?.rootCauseCategoryId"
        class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6"
      >
        <div
          class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
        >
          Investigation findings
        </div>

        <div v-if="nc.rootCauseCategoryId" class="tw:mb-3">
          <div class="tw:text-xs tw:text-secondary tw:mb-1">Root cause category</div>
          <BaseBadge class="tw:bg-amber-100 tw:text-amber-700">
            {{ nc.rootCauseCategoryId }}
          </BaseBadge>
        </div>

        <div v-if="nc.rootCause">
          <div class="tw:text-xs tw:text-secondary tw:mb-1">Root cause</div>
          <p class="tw:text-sm tw:text-on-main tw:leading-relaxed">{{ nc.rootCause }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'remove', 'moveUp', 'moveDown'])

const approverLabel = computed(() => {
  const roles = props.step.roleIds?.length || 0
  const users = props.step.reviewerIds?.length || 0
  const parts = []
  if (roles > 0) parts.push(`${roles} Role${roles !== 1 ? 's' : ''}`)
  if (users > 0) parts.push(`${users} User${users !== 1 ? 's' : ''}`)
  return parts.length > 0 ? parts.join(', ') : 'No approvers'
})
</script>

<template>
  <div
    class="tw:group tw:relative tw:bg-main tw:p-4 tw:rounded-xl tw:border-2 tw:shadow-sm tw:transition-all tw:cursor-pointer"
    :class="
      isSelected
        ? 'tw:border-primary tw:ring-4 tw:ring-primary/5'
        : 'tw:border-divider tw:hover:border-secondary'
    "
    @click="emit('select')"
  >
    <div class="tw:flex tw:items-start tw:gap-3">
      <!-- Step Number -->
      <div
        class="tw:mt-0.5 tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:shrink-0"
        :class="isSelected ? 'tw:bg-primary tw:text-white' : 'tw:bg-main-hover tw:text-secondary'"
      >
        {{ index + 1 }}
      </div>

      <!-- Step Info -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:flex tw:items-center tw:justify-between tw:mb-1">
          <h3 class="tw:text-sm tw:font-bold tw:text-on-main tw:truncate">
            {{ step.name }}
          </h3>
          <span
            class="tw:text-[10px] tw:font-bold tw:px-1.5 tw:py-0.5 tw:rounded tw:shrink-0"
            :class="
              step.approvalRule === 'ALL'
                ? 'tw:bg-primary/10 tw:text-primary'
                : 'tw:bg-main-hover tw:text-secondary'
            "
          >
            {{ step.approvalRule }}
          </span>
        </div>

        <div class="tw:flex tw:items-center tw:gap-3 tw:text-xs tw:text-secondary">
          <span class="tw:flex tw:items-center tw:gap-1">
            <WIcon icon="groups" size="16px" />
            {{ approverLabel }}
          </span>
          <span v-if="step.slaDays" class="tw:flex tw:items-center tw:gap-1">
            <WIcon icon="schedule" size="16px" />
            {{ step.slaDays }} Day{{ step.slaDays !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- Actions Menu -->
      <div
        v-if="canUpdate"
        class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:shrink-0"
      >
        <WBtn icon="more_vert" flat round dense size="sm" color="grey-6">
          <QMenu>
            <QList dense style="min-width: 140px">
              <QItem v-if="!isFirst" v-close-popup clickable @click.stop="emit('moveUp')">
                <QItemSection side>
                  <WIcon icon="arrow_upward" size="18px" />
                </QItemSection>
                <QItemSection>Move Up</QItemSection>
              </QItem>
              <QItem v-if="!isLast" v-close-popup clickable @click.stop="emit('moveDown')">
                <QItemSection side>
                  <WIcon icon="arrow_downward" size="18px" />
                </QItemSection>
                <QItemSection>Move Down</QItemSection>
              </QItem>
              <QSeparator v-if="!isFirst || !isLast" />
              <QItem v-close-popup clickable class="tw:text-bad" @click.stop="emit('remove')">
                <QItemSection side>
                  <WIcon icon="delete" size="18px" class="tw:text-bad" />
                </QItemSection>
                <QItemSection>Delete</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </WBtn>
      </div>
    </div>
  </div>
</template>

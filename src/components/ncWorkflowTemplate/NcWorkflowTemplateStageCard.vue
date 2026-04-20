<script setup>
import {
  IconUsers,
  IconClock,
  IconWriting,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconDots,
} from '@tabler/icons-vue'

const props = defineProps({
  stage: { type: Object, required: true },
  index: { type: Number, required: true },
  isSelected: { type: Boolean, default: false },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'remove', 'moveUp', 'moveDown'])

const userCount = useLiveQueryWithDeps(
  [() => props.stage?.id],
  async (db, [stageId]) => {
    if (!stageId) return 0
    const all = await db.NcWorkflowTemplateStageUser.where('stageId', stageId).exec()
    return all.length
  },
  { initial: 0 },
)

const menuItems = computed(() => {
  const items = []
  if (!props.isFirst)
    items.push({ name: 'Move Up', icon: IconArrowUp, click: () => emit('moveUp') })
  if (!props.isLast)
    items.push({ name: 'Move Down', icon: IconArrowDown, click: () => emit('moveDown') })
  items.push({ name: 'Delete', icon: IconTrash, click: () => emit('remove') })
  return items
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
      <!-- Stage Number -->
      <div
        class="tw:mt-0.5 tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:shrink-0"
        :class="isSelected ? 'tw:bg-primary tw:text-white' : 'tw:bg-main-hover tw:text-secondary'"
      >
        {{ index + 1 }}
      </div>

      <!-- Stage Info -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:flex tw:items-center tw:justify-between tw:mb-1">
          <h3 class="tw:text-sm tw:font-bold tw:text-on-main tw:truncate">{{ stage.name }}</h3>
          <IconWriting
            v-if="stage.requireEsignature"
            :size="14"
            class="tw:text-secondary tw:shrink-0 tw:ml-1"
            title="Requires e-signature"
          />
        </div>

        <div class="tw:flex tw:items-center tw:gap-3 tw:text-xs tw:text-secondary">
          <span class="tw:flex tw:items-center tw:gap-1">
            <IconUsers :size="14" />
            {{ userCount }} User{{ userCount !== 1 ? 's' : '' }}
          </span>
          <span v-if="stage.slaDays" class="tw:flex tw:items-center tw:gap-1">
            <IconClock :size="14" />
            {{ stage.slaDays }}d
          </span>
        </div>
      </div>

      <!-- Actions Menu -->
      <div
        v-if="canUpdate"
        class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:shrink-0"
      >
        <BaseMenu :items="menuItems">
          <template #trigger>
            <button
              class="tw:p-1 tw:rounded tw:hover:bg-main-hover tw:text-secondary tw:transition-colors"
              @click.stop
            >
              <IconDots :size="18" />
            </button>
          </template>
        </BaseMenu>
      </div>
    </div>
  </div>
</template>

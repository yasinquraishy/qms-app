<script setup>
import { computed } from 'vue'
import { useToast } from '@shared/composables/useToast.js'

const { toasts, dismiss } = useToast()

const positionClasses = {
  top: 'tw:top-4 tw:left-1/2 tw:-translate-x-1/2 tw:flex-col',
  'top-right': 'tw:top-4 tw:right-4 tw:flex-col',
  'top-left': 'tw:top-4 tw:left-4 tw:flex-col',
  bottom: 'tw:bottom-4 tw:left-1/2 tw:-translate-x-1/2 tw:flex-col-reverse',
  'bottom-right': 'tw:bottom-4 tw:right-4 tw:flex-col-reverse',
  'bottom-left': 'tw:bottom-4 tw:left-4 tw:flex-col-reverse',
  center: 'tw:top-1/2 tw:left-1/2 tw:-translate-x-1/2 tw:-translate-y-1/2 tw:flex-col',
}

// Slide direction based on which edge the position is near
const slideFrom = {
  top: 'tw:opacity-0 tw:-translate-y-full',
  'top-right': 'tw:opacity-0 tw:translate-x-full',
  'top-left': 'tw:opacity-0 tw:-translate-x-full',
  bottom: 'tw:opacity-0 tw:translate-y-full',
  'bottom-right': 'tw:opacity-0 tw:translate-x-full',
  'bottom-left': 'tw:opacity-0 tw:-translate-x-full',
  center: 'tw:opacity-0 tw:scale-95',
}

const groupedToasts = computed(() => {
  const groups = {}
  for (const toast of toasts.value) {
    const pos = toast.position || 'top'
    if (!groups[pos]) groups[pos] = []
    groups[pos].push(toast)
  }
  return groups
})
</script>

<template>
  <Teleport to="body">
    <div
      v-for="(items, position) in groupedToasts"
      :key="position"
      :class="[
        'tw:fixed tw:z-100 tw:flex tw:gap-2 tw:pointer-events-none',
        positionClasses[position] || positionClasses.top,
      ]"
    >
      <TransitionGroup
        enterActiveClass="tw:transition-all tw:duration-300 tw:ease-out"
        :enterFromClass="slideFrom[position] || slideFrom.top"
        enterToClass="tw:opacity-100 tw:translate-x-0 tw:translate-y-0 tw:scale-100"
        leaveActiveClass="tw:transition-all tw:duration-200 tw:ease-in"
        leaveFromClass="tw:opacity-100 tw:translate-x-0 tw:translate-y-0 tw:scale-100"
        :leaveToClass="slideFrom[position] || slideFrom.top"
        moveClass="tw:transition-all tw:duration-300 tw:ease-out"
      >
        <BaseToast
          v-for="toast in items"
          :id="toast.id"
          :key="toast.id"
          :type="toast.type"
          :message="toast.message"
          :caption="toast.caption"
          :html="toast.html"
          :multiLine="toast.multiLine"
          @dismiss="dismiss"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

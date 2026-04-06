<script setup>
const props = defineProps({
  apiKey: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['revoke', 'delete'])

const isRevoked = computed(() => props.apiKey.revoked)

const lastUsedLabel = computed(() => {
  return props.apiKey.lastUsedAt ? props.apiKey.lastUsedAt.formatDate() : 'Never'
})

const expiresLabel = computed(() => {
  return props.apiKey.expiresAt ? props.apiKey.expiresAt.formatDate() : 'Never'
})
</script>

<template>
  <WCard flat bordered class="tw:p-4">
    <div class="tw:flex tw:items-start tw:gap-3">
      <!-- Key Icon -->
      <div
        class="tw:flex tw:items-center tw:justify-center tw:size-10 tw:rounded-lg tw:flex-none"
        :class="isRevoked ? 'tw:bg-red-50' : 'tw:bg-green-50'"
      >
        <WIcon
          name="key"
          size="20px"
          :class="isRevoked ? 'tw:text-red-400' : 'tw:text-green-600'"
        />
      </div>

      <!-- Info -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:text-lg tw:font-bold tw:text-on-main">
          {{ apiKey.name }}
        </div>
        <div v-if="apiKey.label" class="tw:text-sm tw:text-secondary tw:mt-0.5">
          {{ apiKey.label }}
        </div>

        <!-- Metadata row -->
        <div
          class="tw:flex tw:flex-wrap tw:items-center tw:gap-x-4 tw:gap-y-1 tw:mt-2 tw:text-xs tw:text-secondary"
        >
          <QBadge
            :color="isRevoked ? 'red' : 'green'"
            :label="isRevoked ? 'Revoked' : 'Active'"
            rounded
            class="tw:px-2 tw:py-0.5"
          />
          <span>Last used: {{ lastUsedLabel }}</span>
          <span>Expires: {{ expiresLabel }}</span>
        </div>
      </div>

      <!-- Actions Menu -->
      <div class="tw:flex-none" @click.stop>
        <QBtn flat round dense icon="more_vert" color="grey">
          <QMenu>
            <QList>
              <QItem
                v-if="!isRevoked"
                v-close-popup
                clickable
                class="tw:text-warning"
                @click="emit('revoke', apiKey)"
              >
                <QItemSection avatar>
                  <QIcon name="block" color="warning" />
                </QItemSection>
                <QItemSection>Revoke</QItemSection>
              </QItem>
              <QItem
                v-close-popup
                clickable
                class="tw:text-negative"
                @click="emit('delete', apiKey)"
              >
                <QItemSection avatar>
                  <QIcon name="delete" color="negative" />
                </QItemSection>
                <QItemSection>Delete</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </div>
  </WCard>
</template>

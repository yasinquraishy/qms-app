<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['navigate', 'preview', 'delete'])

const router = useRouter()

function navigateToTemplate(mode) {
  const path = getCompanyPath(`/templates/${props.template.id}`)
  const query = mode ? { mode } : undefined
  router.push({ path, query })
  emit('navigate', props.template, mode)
}

function handlePreview() {
  emit('preview', props.template)
}

function handleDelete() {
  emit('delete', props.template)
}
</script>

<template>
  <div
    class="tw:group tw:cursor-pointer tw:bg-sidebar tw:border tw:border-divider tw:rounded-lg tw:p-3 tw:transition-all tw:hover:shadow-md tw:hover:border-primary/30"
    @click="navigateToTemplate()"
  >
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:gap-3 tw:items-start">
        <!-- Content Section -->
        <div class="tw:flex tw:flex-col tw:gap-1">
          <!-- Title and Code -->
          <div class="tw:flex tw:items-center tw:gap-3">
            <h4 class="tw:text-lg tw:font-bold tw:text-on-sidebar">
              {{ template.title }}
            </h4>
            <span
              class="ds-label-sm tw:px-2 tw:py-0.5 tw:rounded tw:bg-main tw:text-secondary tw:font-mono"
            >
              Code: {{ template.code }}
            </span>
          </div>

          <!-- Metadata Row -->
          <div class="tw:flex tw:items-center tw:gap-4 tw:text-sm tw:text-secondary">
            <div class="tw:flex tw:items-center tw:gap-1.5">
              <WIcon icon="history" size="18px" />
              <span>Version: v{{ template.version }}</span>
            </div>
            <div class="tw:flex tw:items-center tw:gap-1.5">
              <WIcon icon="update" size="18px" />
              <span>Modified: {{ template.updatedAt.toRelative() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Status and Actions -->
      <div class="tw:flex tw:items-center tw:gap-3">
        <!-- Status Badge -->
        <div class="tw:flex tw:flex-col tw:items-end tw:gap-2">
          <WStatusBadge :status="template.statusId" variant="formTemplate" showDot />
        </div>

        <!-- Action Buttons -->
        <div class="tw:flex tw:items-center tw:gap-2">
          <WBtn flat round icon="more_vert" size="sm" class="tw:text-secondary">
            <QMenu>
              <QList dense style="min-width: 160px">
                <QItem v-close-popup clickable @click="navigateToTemplate()">
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon icon="edit" size="20px" class="tw:text-primary" />
                      <div>Edit</div>
                    </div>
                  </QItemSection>
                </QItem>
                <QItem v-close-popup clickable @click="navigateToTemplate('schema')">
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon icon="design_services" size="20px" class="tw:text-primary" />
                      <div>Design</div>
                    </div>
                  </QItemSection>
                </QItem>
                <QItem v-close-popup clickable @click="handlePreview">
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon icon="visibility" size="20px" class="tw:text-secondary" />
                      <div>Preview</div>
                    </div>
                  </QItemSection>
                </QItem>
                <QSeparator />
                <QItem
                  v-if="canDelete"
                  v-close-popup
                  clickable
                  class="tw:text-negative"
                  @click="handleDelete"
                >
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon icon="delete" size="20px" />
                      <div>Delete</div>
                    </div>
                  </QItemSection>
                </QItem>
              </QList>
            </QMenu>
          </WBtn>
        </div>
      </div>
    </div>
  </div>
</template>

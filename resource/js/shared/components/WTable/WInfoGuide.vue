<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import WBtn from '../button/WBtn'
import infoGuides from '@/stores/Data/infoGuides.json'
import helplineLinks from '@/stores/Data/helpline-links.json'
import Help from '@/components/common/Help.vue'
import Tour from '@/layouts/components/Tour.vue'

const props = defineProps({
  dataKey: {
    type: String,
    required: true,
  },
  hideButton: {
    type: Boolean,
    default: false,
  },
  showCloseButton: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  showSummary: {
    type: Boolean,
    default: false,
  },
  banner: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['create', 'close'])
const getHyperlink = (hyperlinkKey) => {
  const hyperlink = helplineLinks.HelpLink.find((item) => item.key === hyperlinkKey)
  return hyperlink
}
const isHidden = ref(false)
const imageDialog = ref(false)
const imageUrl = ref('')
const helpRef = ref(null)
const currentHelpKey = ref(null)
const isVisible = computed(() => {
  return (
    !isHidden.value &&
    ((infoState.value.summary && props.showSummary) ||
      props.showCloseButton ||
      (infoState.value?.title && !props.showSummary) ||
      (Array.isArray(infoState.value.message) && !props.showSummary) ||
      (!Array.isArray(infoState.value.message) && !props.showSummary) ||
      (!props.showSummary && infoState.value.thumbnail !== 'none') ||
      !props.hideButton)
  )
})

const infoState = computed(() => {
  const state = infoGuides.find((state) => state.key === props.dataKey) || {
    icon: undefined,
    title: '',
    message: '',
    button: {
      label: 'Create New',
      icon: 'sym_r_add',
    },
    summary: '',
    thumbnail: 'https://cloud.wire2air.com/assets/help/GenericMockup-red.png',
    helplinkkey: '',
  }
  return state
})

const handleClose = () => {
  if (!props.persistent) {
    isHidden.value = true
  }
  emit('close')
}

const processMessage = (msg) => {
  // If the message contains help-link-key, add our custom class
  if (msg.includes('help-link-key')) {
    const div = document.createElement('div')
    div.innerHTML = msg
    // Find all elements with help-link-key attribute
    const helpElements = div.querySelectorAll('[help-link-key]')
    helpElements.forEach((element) => {
      element.classList.add('help-link')
    })
    return div.innerHTML
  }
  return msg
}
const helpbuttonclick = (helpKey) => {
  if (helpKey && helpRef.value) {
    currentHelpKey.value = helpKey
    nextTick(() => {
      helpRef.value.handleHelpLink()
    })
  }
}

const handleMessageClick = (event) => {
  // Find the clicked element with help-link-key attribute
  const helpElement = event.target.closest('[help-link-key]')
  if (helpElement) {
    event.preventDefault()
    event.stopPropagation()
    const helpKey = helpElement.getAttribute('help-link-key')
    if (helpKey && helpRef.value) {
      currentHelpKey.value = helpKey
      nextTick(() => {
        helpRef.value.handleHelpLink()
      })
    }
  }
}

const attachImageClickHandler = () => {
  nextTick(() => {
    const links = document.querySelectorAll('.open-help-image')
    links.forEach((link) => {
      // Clone the node to remove any existing listeners
      const cloned = link.cloneNode(true)
      link.replaceWith(cloned)
      cloned.addEventListener('click', (e) => {
        e.preventDefault()
        imageUrl.value = cloned.getAttribute('href') || ''
        imageDialog.value = true
      })
    })
  })
}

watch(infoState, attachImageClickHandler)
onMounted(attachImageClickHandler)
</script>

<template>
  <div v-if="isVisible" class="full-width">
    <div v-if="infoState.summary && showSummary" class="row items-center q-gutter-sm">
      <span class="summary-text" @click="handleMessageClick($event)">
        <template v-if="getHyperlink(infoState?.helplinkkey || props.dataKey)">
          <span v-html="processMessage(infoState.summary)" />
          <WBtn
            tooltip="Read Documentation"
            class="q-ml-xs align-bottom"
            flat
            round
            size="12px"
            style="vertical-align: middle"
            @click.stop="helpbuttonclick(infoState?.helplinkkey || props.dataKey)"
          >
            <WIcon icon="tabler:book" />
          </WBtn>
          <Tour
            tooltip="Tour"
            :tourLinkKey="infoState?.helplinkkey || props.dataKey"
            style="vertical-align: middle"
          />
        </template>
        <template v-else>
          <span v-html="processMessage(infoState.summary)" />
        </template>
      </span>
    </div>
    <WCard class="row no-wrap items-start relative-position" flat v-bind="$attrs">
      <QCardSection class="full-width q-py-none">
        <div v-if="showCloseButton" class="close-button absolute-top-right">
          <WBtn flat round dense color="grey-7" icon="sym_r_close" @click="handleClose" />
        </div>

        <div class="content-wrapper">
          <div v-if="infoState?.title && !showSummary" class="font-bold mb-2">
            <h2 class="q-mt-sm q-mb-sm text-primary">
              {{ infoState.title }}
            </h2>
          </div>
          <template v-if="Array.isArray(infoState.message) && !showSummary">
            <div class="flex justify-center">
              <ul v-if="infoState.message.length > 1" class="custom-bullets">
                <li
                  v-for="(msg, index) in infoState.message"
                  :key="index"
                  :class="[
                    msg.startsWith('<div') || msg.startsWith('<img') ? 'no-bullet' : '',
                    msg.includes('help-link-key') ? 'has-help-link' : '',
                  ]"
                  @click="handleMessageClick($event)"
                  v-html="processMessage(msg)"
                />
              </ul>
              <div
                v-else
                class="text-center"
                @click="handleMessageClick($event)"
                v-html="processMessage(infoState.message[0])"
              />
            </div>
          </template>
          <template v-if="!Array.isArray(infoState.message) && !showSummary">
            <div @click="handleMessageClick($event)" v-html="processMessage(infoState.message)" />
          </template>
          <template v-if="!showSummary && infoState.thumbnail !== 'none'">
            <div>
              <img
                :src="
                  infoState.thumbnail ||
                  'https://cloud.wire2air.com/assets/help/GenericMockup-red.png'
                "
                style="max-inline-size: 100%; block-size: auto; max-block-size: 400px"
              />
            </div>
          </template>
          <div v-if="!hideButton" class="row justify-center q-mt-md">
            <div class="row q-gutter-md">
              <slot name="info-actions">
                <WBtn
                  v-if="infoState?.button?.label"
                  :icon="infoState.button.icon"
                  color="primary"
                  @click="$emit('create')"
                >
                  {{ infoState.button.label }}
                </WBtn>
              </slot>
              <WBtn
                v-if="getHyperlink(infoState?.helplinkkey || props.dataKey)"
                color="primary"
                @click="helpbuttonclick(infoState?.helplinkkey || props.dataKey)"
              >
                <WIcon icon="tabler:book" />
                Read Documentation
              </WBtn>
            </div>
          </div>
        </div>
      </QCardSection>
    </WCard>
  </div>

  <WDialog v-model="imageDialog" title=" " persistent>
    <img :src="imageUrl" alt="Help Example" style="max-block-size: 70vh; max-inline-size: 100%" />
  </WDialog>
  <Help ref="helpRef" :helpLinkKey="currentHelpKey" :fromWLabel="true" />
</template>

<style scoped>
.custom-bullets {
  list-style-position: inside !important;
  list-style-type: disc !important;
  margin-block-end: 0 !important;
  padding-inline-start: 1.5rem !important;
  text-align: start;
}

.custom-bullets li {
  font-size: 16px;
  margin-block-end: 0.5rem;
}

.close-button {
  z-index: 1;
  margin: 4px;
}

.absolute-top-right {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}

.content-wrapper {
  font-size: 16px;
  margin-block-start: 8px;
  padding-inline-end: 36px; /* Space for close button */
  text-align: center;
}

.summary-text {
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
  word-break: break-word;
}

:deep(.help-link) {
  color: var(--q-primary);
  cursor: pointer;
  text-decoration: none;
}

:deep(.help-link:hover) {
  text-decoration: underline;
}

.no-bullet {
  list-style-type: none !important;
  margin-inline-start: 0 !important;
  padding-inline-start: 0 !important;
}

:deep(.quote-block) {
  border-inline-start: 4px solid #ccc;
  font-style: italic;
  margin-block: 16px;
  padding-inline-start: 16px;
}

.has-help-link {
  cursor: pointer;
}

:deep(.quote-block-alert) {
  border-radius: 4px;
  background: #fff5f5;
  border-inline-start: 4px solid #d72d2d;
  margin-block: 16px 0;
  padding-inline-start: 12px 16px;
}

:deep(.quote-block-info) {
  border-radius: 4px;
  background: #f1f8ff;
  border-inline-start: 4px solid #1f6feb;
  margin-block: 16px 0;
  padding-inline-start: 12px 16px;
}
</style>

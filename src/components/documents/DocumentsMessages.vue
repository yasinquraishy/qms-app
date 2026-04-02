<script setup>
import { useDocumentMessages } from '@/composables/useDocumentMessages.js'
import { currentSession } from '@/utils/currentSession.js'

const props = defineProps({
  documentId: { type: String, required: true },
})

const model = defineModel({ type: Boolean, default: false })

const { messages, loading, fetchMessages, sendMessage, deleteMessage, joinRoom, leaveRoom } =
  useDocumentMessages()

const newMessage = ref('')
const messagesContainer = ref(null)

const currentUserId = computed(() => currentSession.value?.id)

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(
  () => messages.value.length,
  () => scrollToBottom(),
)

watch(model, async (open) => {
  if (open) {
    joinRoom(props.documentId)
    await fetchMessages(props.documentId)
    scrollToBottom()
  } else {
    leaveRoom()
  }
})

async function handleSend() {
  const body = newMessage.value.trim()
  if (!body) return
  newMessage.value = ''
  await sendMessage(props.documentId, body)
  scrollToBottom()
}

function handleDelete(id) {
  deleteMessage(id)
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="model" class="tw:fixed tw:inset-0 tw:bg-black/30 tw:z-40" @click="model = false" />
  </Transition>

  <!-- Sidebar Panel -->
  <Transition name="slide-right">
    <aside
      v-if="model"
      class="tw:fixed tw:top-0 tw:right-0 tw:h-full tw:w-100 tw:max-w-full tw:z-50 tw:flex! tw:flex-col tw:bg-sidebar tw:shadow-xl"
    >
      <!-- Header -->
      <div
        class="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-divider"
      >
        <div class="tw:flex tw:items-center tw:gap-2">
          <WIcon name="forum" size="22px" class="tw:text-primary" />
          <span class="tw:text-base tw:font-semibold tw:text-on-main">Discussion</span>
        </div>
        <WBtn flat round dense @click="model = false">
          <WIcon name="close" size="20px" />
        </WBtn>
      </div>

      <!-- Messages List -->
      <div
        ref="messagesContainer"
        class="tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-3 tw:space-y-4"
        :class="{ 'tw:flex tw:items-center tw:justify-center': messages.length === 0 }"
      >
        <!-- Loading -->
        <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
          <QSpinner color="primary" size="30px" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="messages.length === 0"
          class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-12 tw:text-secondary"
        >
          <WIcon name="chat_bubble_outline" size="48px" class="tw:mb-2 tw:opacity-40" />
          <p class="tw:text-sm">No messages yet</p>
          <p class="tw:text-xs tw:mt-1">Start the conversation</p>
        </div>

        <!-- Message Bubbles -->
        <template v-else>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="tw:group tw:flex tw:gap-2"
            :class="msg.userId === currentUserId ? 'tw:flex-row-reverse' : 'tw:flex-row'"
          >
            <UserAvatar
              v-if="msg.userId !== currentUserId"
              :user="msg.user"
              class="tw:size-8 tw:shrink-0 tw:mt-1"
            />

            <div
              class="tw:max-w-[75%] tw:rounded-xl tw:px-3 tw:py-2"
              :class="
                msg.userId === currentUserId
                  ? 'tw:bg-primary tw:text-white tw:rounded-tr-sm'
                  : 'tw:bg-gray-100 tw:text-on-main tw:rounded-tl-sm'
              "
            >
              <div
                v-if="msg.userId !== currentUserId && msg.user"
                class="tw:text-xs tw:font-semibold tw:mb-0.5 tw:text-primary"
              >
                {{ msg.user.firstName }} {{ msg.user.lastName }}
              </div>
              <p class="tw:text-sm tw:whitespace-pre-wrap tw:wrap-break-word tw:m-0">
                {{ msg.body }}
              </p>
              <div
                class="tw:text-[10px] tw:mt-1 tw:text-right"
                :class="msg.userId === currentUserId ? 'tw:text-white/60' : 'tw:text-secondary'"
              >
                {{ msg.createdAt?.formatDate?.('datetime') || '' }}
              </div>
            </div>

            <!-- Delete own message -->
            <WBtn
              v-if="msg.userId === currentUserId"
              flat
              round
              dense
              size="sm"
              class="tw:self-center tw:opacity-0 tw:group-hover:opacity-100"
              @click="handleDelete(msg.id)"
            >
              <WIcon name="delete_outline" size="16px" class="tw:text-secondary" />
            </WBtn>
          </div>
        </template>
      </div>

      <!-- Input Area -->
      <div class="tw:border-t tw:border-divider tw:px-4 tw:py-3">
        <div class="tw:flex tw:items-end tw:gap-2">
          <QInput
            v-model="newMessage"
            type="textarea"
            autogrow
            :maxlength="2000"
            placeholder="Type a message..."
            dense
            outlined
            class="tw:flex-1"
            :inputStyle="{ maxHeight: '120px' }"
            @keydown.enter.exact.prevent="handleSend"
          />
          <WBtn
            round
            color="primary"
            unelevated
            dense
            :disable="!newMessage.trim()"
            @click="handleSend"
          >
            <WIcon name="send" size="18px" />
          </WBtn>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>

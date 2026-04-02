<script setup>
import { ref } from 'vue'
import { useTextEditor } from '@shared/composables/textEditor'

const emit = defineEmits(['insert', 'replace'])
const { generateMessage } = useTextEditor()
const prompt = ref('')
const text = ref('')
const open = ref(false)
const menu = ref(false)
const loading = ref(false)

async function request() {
  menu.value = false
  loading.value = true
  open.value = true
  text.value = await generateMessage(prompt.value)
  prompt.value = ''
  loading.value = false
}

function replace() {
  open.value = false
  emit('replace', text.value)
}

function insert() {
  open.value = false
  emit('insert', text.value)
}
</script>

<template>
  <div class="q-pb-xs prompt-icon">
    <WIcon icon="sym_o_prompt_suggestion" class="cursor-pointer" color="primary">
      <QMenu v-model="menu">
        <QForm class="q-pa-sm" @submit.prevent="request">
          <WInput v-model="prompt" type="textarea" label="Enter prompt" />
          <div class="row justify-end q-mt-sm">
            <WBtn label="Request" size="sm" flat type="submit" />
          </div>
        </QForm>
      </QMenu>
    </WIcon>

    <WDialog v-model="open">
      <div v-if="loading" class="column">
        <QSkeleton height="150px" />
        <div class="row justify-end">
          <QSkeleton width="50%" height="35px" class="q-mt-sm" />
        </div>
      </div>

      <div v-else>
        <WCard class="q-pa-md text-subtitle-2" flat bordered>
          {{ text }}
        </WCard>

        <div class="row justify-end q-mt-sm">
          <WBtn label="Replace" class="q-mr-md" outline @click="replace" />
          <WBtn label="Insert" @click="insert" />
        </div>
      </div>
    </WDialog>
  </div>
</template>

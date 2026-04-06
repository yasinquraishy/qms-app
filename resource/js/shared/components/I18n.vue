<script setup>
defineOptions({
  name: 'AppI18n',
})
const props = defineProps({
  languages: {
    type: Array,
    default: () => [],
  },
  anchor: {
    type: String,
    default: 'bottom end',
  },
})

const emit = defineEmits(['change'])
import { useI18n } from 'vue-i18n'
import WBtn from './button/WBtn.vue'
import WIcon from './icon/WIcon.vue'

const { locale } = useI18n({ useScope: 'global' })

function onListItemClick(lang) {
  locale.value = lang.i18nLang
  emit('change', lang.i18nLang)
}
</script>

<template>
  <WBtn color="default" icon size="small" variant="text">
    <WIcon icon="tabler-language" size="24" />
    <!-- Menu -->
    <QMenu :anchor="props.anchor" maxWidth="180px" activator="parent" :offset="[0, 14]">
      <!-- List -->
      <QList minWidth="175px">
        <!-- List item -->
        <QItem
          v-for="lang in props.languages"
          :key="lang.i18nLang"
          :value="lang.i18nLang"
          @click="onListItemClick(lang)"
        >
          <!-- Language label -->
          <h3 class="q-pa-sm">
            {{ lang.label }}
          </h3>
        </QItem>
      </QList>
    </QMenu>
  </WBtn>
</template>

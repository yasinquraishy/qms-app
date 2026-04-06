<script setup>
defineProps({
  title: {
    type: String,
    default: 'Sections & Default Content Builder',
  },
  showReorder: {
    type: Boolean,
    default: true,
  },
  readonlyCheck: {
    type: Function,
    default: () => false,
  },
})

const sections = defineModel({
  type: Array,
  required: true,
})

function addSection() {
  const maxOrder = Math.max(...sections.value.map((s) => s.order), 0)
  const newSection = {
    id: crypto.randomUUID(),
    order: maxOrder + 1,
    title: '',
    sectionType: 'text',
  }
  // Add the appropriate content field
  newSection.content = ''
  sections.value.push(newSection)
}

function removeSection(id) {
  sections.value = sections.value.filter((s) => s.id !== id)
  // Reorder
  sections.value.forEach((s, index) => {
    s.order = index + 1
  })
}

function moveSectionUp(index) {
  if (index === 0) return
  const temp = sections.value[index]
  sections.value[index] = sections.value[index - 1]
  sections.value[index - 1] = temp
  // Reorder
  sections.value.forEach((s, i) => {
    s.order = i + 1
  })
}

function moveSectionDown(index) {
  if (index === sections.value.length - 1) return
  const temp = sections.value[index]
  sections.value[index] = sections.value[index + 1]
  sections.value[index + 1] = temp
  // Reorder
  sections.value.forEach((s, i) => {
    s.order = i + 1
  })
}
</script>

<template>
  <div class="tw:space-y-4">
    <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
      <WIcon name="view_quilt" class="tw:text-primary" size="22px" />
      <h2 class="tw:text-lg tw:font-bold">{{ title }}</h2>
    </div>

    <!-- Section Items -->
    <div
      v-for="(section, index) in sections"
      :key="section.id"
      class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:p-6 group tw:relative"
    >
      <div class="tw:flex tw:flex-col tw:md:flex-row tw:gap-6">
        <!-- Order & Reorder Buttons -->
        <div class="tw:flex tw:flex-col tw:items-center tw:gap-2">
          <span
            class="tw:inline-flex tw:items-center tw:justify-center tw:h-8 tw:w-8 tw:rounded-full tw:bg-main-hover tw:text-sm tw:font-bold tw:text-secondary"
          >
            {{ index + 1 }}
          </span>
          <div
            v-if="showReorder"
            class="tw:flex tw:flex-col tw:gap-1 tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity"
          >
            <WBtn
              flat
              dense
              round
              size="sm"
              icon="expand_less"
              :disable="index === 0"
              @click="moveSectionUp(index)"
            />
            <WBtn
              flat
              dense
              round
              size="sm"
              icon="expand_more"
              :disable="index === sections.length - 1"
              @click="moveSectionDown(index)"
            />
          </div>
        </div>

        <!-- Section Content -->
        <div class="tw:flex-1 tw:space-y-4">
          <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
            <div>
              <WInput
                v-model="section.title"
                label="Section Title"
                placeholder="e.g. Purpose"
                outlined
                dense
                hideBottomSpace
                :readonly="readonlyCheck(section)"
              />
            </div>
            <div>
              <WSelect
                v-model="section.sectionType"
                label="Section Type"
                :options="[
                  { label: 'Text', value: 'text' },
                  { label: 'Attachment', value: 'attachment' },
                ]"
                outlined
                dense
                hideBottomSpace
                optionLabel="label"
                optionValue="value"
                emitValue
                mapOptions
                :readonly="readonlyCheck(section)"
                :disable="readonlyCheck(section)"
              />
            </div>
          </div>

          <!-- Content Area -->
          <div v-if="section.sectionType === 'text'">
            <TiptapEditor v-model="section.content" :readonly="readonlyCheck(section)" />
          </div>
          <div v-else-if="section.sectionType === 'attachment'">
            <WUploader
              v-model="section.attachments"
              hideHeader
              class="tw:border-transparent tw:shadow-none!"
            />
          </div>
          <div
            v-else
            class="tw:border tw:border-divider tw:rounded-lg tw:h-24 tw:flex tw:items-center tw:justify-center tw:bg-main-hover"
          >
            <p class="tw:text-sm tw:text-secondary tw:italic">
              {{ section.sectionType }} configuration coming soon...
            </p>
          </div>
        </div>

        <!-- Delete Button -->
        <div class="tw:flex tw:flex-col tw:justify-start">
          <WBtn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="removeSection(section.id)"
          />
        </div>
      </div>
    </div>

    <!-- Add Section Button -->
    <button
      class="tw:w-full tw:py-6 tw:border-2 tw:border-dashed tw:border-divider tw:rounded-xl tw:text-secondary tw:hover:text-primary tw:hover:border-primary tw:hover:bg-primary/5 tw:transition-all tw:flex tw:items-center tw:justify-center tw:gap-2 tw:font-semibold"
      @click="addSection"
    >
      <WIcon name="add_circle" />
      Add Another Section
    </button>
  </div>
</template>

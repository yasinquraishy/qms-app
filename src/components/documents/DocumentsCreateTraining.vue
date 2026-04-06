<script setup>
import { useSortable } from '@vueuse/integrations/useSortable'

// Props can be added here if needed in future
const form = defineModel({
  type: Object,
  default: () => ({
    questions: [{}],
  }),
})

const questionBlockContainer = useTemplateRef('questionBlockContainer')

function addQuestion() {
  if (!form.value.questions) {
    form.value.questions = []
  }
  form.value.questions.push({
    questionText: '',
    answers: ['', ''],
    correctAnswer: 0,
  })
}

useSortable(questionBlockContainer, {
  handle: '.drag-handle',
  animation: 150,
})
</script>

<template>
  <div class="tw:space-y-6">
    <section class="tw:flex! tw:flex-nowrap tw:gap-6">
      <div class="tw:flex-1 tw:rounded-2xl">
        <div class="tw:flex tw:flex-col tw:gap-4 tw:text-center tw:text-secondary">
          <div ref="questionBlockContainer" class="tw:flex tw:flex-col tw:gap-4">
            <DocumentsCreateTrainingQuestionBlock
              v-for="(_, index) in form.questions"
              :key="index"
              v-model="form.questions[index]"
            />
          </div>

          <!-- Add Question Button -->
          <button
            class="tw:w-full tw:py-6 tw:border-2 tw:border-dashed tw:border-divider tw:rounded-xl tw:text-secondary tw:hover:text-primary tw:hover:border-primary tw:hover:bg-primary/5 tw:transition-all tw:flex tw:items-center tw:justify-center tw:gap-2 tw:font-semibold"
            @click="addQuestion"
          >
            <WIcon name="add_circle" />
            Add Another Question
          </button>
        </div>
      </div>

      <DocumentsCreateTrainingAssessmentSettings v-model="form" />
    </section>
  </div>
</template>

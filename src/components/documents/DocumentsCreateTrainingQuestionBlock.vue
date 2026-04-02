<script setup>
const form = defineModel({
  type: Object,
  default: () => ({
    questionText: '',
    answers: ['', ''],
    correctAnswer: 0,
  }),
})

function addAnswer() {
  if (!form.value.answers) {
    form.value.answers = []
  }
  form.value.answers.push('')
}

function removeAnswer(index) {
  const newAnswers = [...form.value.answers]
  if (newAnswers.length > 2) {
    newAnswers.splice(index, 1)
    form.value.answers = newAnswers
    if (form.value.correctAnswer === index) {
      form.value.correctAnswer = 0
    } else if (form.value.correctAnswer > index) {
      form.value.correctAnswer -= 1
    }
  }
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:overflow-hidden tw:group"
  >
    <div
      class="tw:px-6 tw:py-3 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:justify-between"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <WIcon
          name="drag_indicator"
          class="tw:text-secondary tw:text-sm! tw:cursor-grab tw:active:cursor-grabbing tw:hover:text-on-sidebar tw:transition-colors drag-handle"
        />
        <span class="ds-label tw:text-on-sidebar"> Question 1 </span>
      </div>

      <WBtn icon="delete" flat round size="sm" color="red" />
    </div>
    <div class="tw:p-6 tw:space-y-6">
      <div class="tw:space-y-2 tw:text-start">
        <label class="tw:text-sm tw:font-medium tw:text-on-sidebar">Question Text</label>
        <WInput
          v-model="form.questionText"
          placeholder="eg. What is the correct procedure for reporting a minor deviation?"
          class="tw:mt-1"
        />
      </div>
      <div class="tw:text-start tw:space-y-2">
        <label class="tw:text-sm tw:font-medium tw:text-on-sidebar">
          Answers (Select the correct one)
        </label>

        <div class="tw:flex tw:flex-col tw:gap-3 tw:mt-1">
          <!-- Answer Option 1 -->
          <div
            v-for="(_, index) in form.answers"
            :key="index"
            class="tw:flex tw:flex-nowrap tw:items-center tw:gap-3"
          >
            <input
              :checked="form.correctAnswer === index"
              class="tw:w-4 tw:h-4 tw:text-primary tw:focus:ring-primary tw:border tw:border-divider tw:dark:bg-sidebar tw:cursor-pointer"
              name="q1"
              type="radio"
              @change="form.correctAnswer = index"
            />
            <WInput
              v-model="form.answers[index]"
              placeholder="Write the answer"
              class="tw:flex-1"
            />

            <button class="tw:text-secondary tw:hover:text-on-sidebar" @click="removeAnswer(index)">
              <WIcon icon="close" class="tw:text-sm!" />
            </button>
          </div>
        </div>

        <WBtn flat size="sm" @click="addAnswer">
          <WIcon name="add" class="tw:text-sm!" />
          Add Answer
        </WBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnswerButton from "~/components/ui/buttons/AnswerButton.vue";
import type {Question} from "~~/server/assets/data/questions";
import Tag from "~/components/ui/tags/Tag.vue";


const {wrap = true, background = true, question, mode, showExplanation} = defineProps<{
  question: ExamQuestion | Question | null;
  selected?: string
  showCategory?: boolean;
  wrap?: boolean
  background?: boolean
  mode?: 'exam' | 'training',
  scroll?: boolean,
  showExplanation?: boolean;
}>()

defineEmits<{
  'click:answer': [string]
}>()

// Computed to determine if we should show feedback
const shouldShowFeedback = computed(() => {
  return mode === 'training' && showExplanation;
});

const correctAnswer = computed(() => {
  return question?.correctAnswer;
});

</script>

<template>
  <Transition name="question" mode="out-in" appear>
    <div :key="question?.id" class="flex-1" :class="{'px-3 py-6 md:p-6': wrap, 'overflow-auto': scroll}">
      <div v-if="question" :class="{'max-w-4xl mx-auto': wrap}">
        <!-- Question -->
        <div class="rounded-xl" :class="{'bg-slate-800/50': background, 'p-6 mb-6': wrap}">
          <div class="flex items-start gap-4">
            <div class="flex-1">
              <div v-if="showCategory" class="inline-flex items-center gap-2 mb-4">
                <Tag>
                  {{ question.metadata.category }}
                </Tag>
              </div>
              <h3 class="text-lg text-white mb-4">{{ question.question }}</h3>

              <!-- 🎯 ADD IMAGE DISPLAY HERE -->
              <div v-if="question.images?.length" class="mt-4 flex justify-center">
                <div class="bg-white rounded-lg p-4 shadow-lg max-w-xs">
                  <div class="flex gap-2">
                    <img
                        v-for="(img, index) in question.images"
                        :key="index"
                        :src="img"
                        :alt="`${question.question} - Bild ${index + 1}`"
                        :class="question.images.length === 1 ? 'w-full' : 'flex-1'"
                        class="h-auto rounded max-h-48 object-contain"
                    >
                  </div>
                </div>
              </div>

              <!-- Answer options -->

              <TransitionGroup name="answers" tag="div" class="grid grid-cols-1 md:grid-cols-1 gap-4 mt-8" appear>
                <AnswerButton
                    v-for="(answer, index) in question.answers"
                    :key="`q${question.id}-${answer.id}`"
                    :class=" `answer-${index}`"
                    :answer
                    :index
                    :is-selected="selected === answer.id"
                    :is-correct="answer.id === correctAnswer"
                    :show-explanation="shouldShowFeedback"
                    @click="$emit('click:answer',answer.id)"
                />
              </TransitionGroup>


              <div
                  v-if="showExplanation"
                  class="mt-6 p-6 rounded-xl backdrop-blur-sm animate-slide-up"
                  :class="{
                        'bg-emerald-500/10 border border-emerald-500/30': selected === question.correctAnswer,
                        'bg-red-500/10 border border-red-500/30': selected !== question.correctAnswer
                      }"
              >
                <div class="flex items-start gap-4">
                  <div
                      class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      :class="{
                          'bg-emerald-500/20': selected === question.correctAnswer,
                          'bg-red-500/20': selected !== question.correctAnswer
                        }"
                  >
                    <svg
                        class="w-5 h-5"
                        :class="{
                            'text-emerald-400': selected === question.correctAnswer,
                            'text-red-400': selected !== question.correctAnswer
                          }"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path
                          v-if="selected === question.correctAnswer"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M5 13l4 4L19 7"
                      />
                      <path
                          v-else
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5
                        class="font-semibold mb-2"
                        :class="{
                            'text-emerald-300': selected === question.correctAnswer,
                            'text-red-300': selected !== question.correctAnswer
                          }"
                    >
                      {{
                        selected === question.correctAnswer ? 'Richtig!' : 'Nicht ganz richtig'
                      }}
                    </h5>
                    <p class="text-slate-200 text-sm leading-relaxed mb-3">{{ question.explanation }}</p>
                    <div
                        v-if="selected !== question.correctAnswer"
                        class="flex items-center gap-2 text-xs">
                          <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                            Richtige Antwort: {{
                              String.fromCharCode(65 + question.answers.findIndex(a => a.id === question.correctAnswer))
                            }}
                          </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.question-enter-active,
.question-leave-active {
  transition: all 0.15s ease-out;
}

.question-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.question-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

.question-enter-to,
.question-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Answer buttons staggered animation */
.answers-enter-active {
  transition: all 0.2s ease-out;
}

.answers-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.answers-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered delay for each answer */
.answer-0 {
  transition-delay: 0ms;
}

.answer-1 {
  transition-delay: 30ms;
}

.answer-2 {
  transition-delay: 60ms;
}

.answer-3 {
  transition-delay: 90ms;
}


/* Slide up animation */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>

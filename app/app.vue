<script lang="ts" setup>
import {type Question, questions} from "~~/data/questions";

const settings = reactive({
  questions: 8,
})

const startTime = ref(Date.now())
const timestamp = useTimestamp({interval: 1000})

const elapsedTime = computed(() => {
  const elapsed = timestamp.value - startTime.value
  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
})


const currentQuestionIndex = ref<number>(0)
const selectedAnswer = ref<string>()

const currentQuestion = computed(() => {
  const question = questions[currentQuestionIndex.value] as Question

  return {
    ...question,
    answers: [...question.answers].sort(() => Math.random() - 0.5)
  }
})
const showExplanation = ref(false)

const selectAnswer = (id: string) => {
  selectedAnswer.value = id
}

const getIdByIndex = (index: number) => {
  return ['A', 'B', 'C', 'D'][index]
}

const prev = () => {
  if (questions.length && currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = questions[currentQuestionIndex.value]!.correctAnswer
  }
}

const next = () => {
  if (currentQuestion.value?.correctAnswer === selectedAnswer.value) {
    selectedAnswer.value = undefined
    currentQuestionIndex.value++
  } else {
    showExplanation.value = true
  }
}
</script>

<template>
  <div class="relative h-full bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div
          class="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"/>
      <div
          class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"
          style="animation-delay: 2s;"/>
      <div
          class="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"
          style="animation-delay: 4s;"/>
    </div>

    <!-- Floating Elements -->
    <div class="absolute top-20 left-20 w-2 h-2 bg-teal-400 rounded-full animate-pulse"/>
    <div class="absolute top-40 right-32 w-1 h-1 bg-teal-400 rounded-full animate-ping"/>
    <div
        class="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
        style="animation-delay: 1s;"/>

    <div class="relative z-10 min-h-screen flex justify-center items-center p-4">
      <div class="w-full max-w-4xl mx-auto animate-fade-in">

        <!-- Header with Progress -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <div
                class="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center animate-glow">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent">
              SBF Trainer
            </h1>
          </div>

          <!-- Progress Indicator -->
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="flex gap-1">
              <div
                  v-for="(count, index) in settings.questions" :key="count" class="w-8 h-1.5  rounded-full"
                  :class="{'bg-teal-500': index=== currentQuestionIndex, 'bg-slate-600': index !== currentQuestionIndex}"/>
            </div>
          </div>
          <p class="text-slate-400 text-sm">Frage {{ currentQuestionIndex + 1 }} von {{ settings.questions }}</p>
        </div>

        <!-- Main Question Card -->
        <div class="relative">
          <!-- Glow Effect -->
          <div
              class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>

          <div
              class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-slide-up">
            <!-- Question -->
            <div class="mb-8 min-h-[120px] flex flex-col justify-start">
              <div class="inline-flex items-center gap-2 mb-4">
                <span
                    class="px-3 py-1 text-xs font-medium capitalize bg-ocean-500/20 text-ocean-300 rounded-full border border-ocean-500/30">
                    {{ currentQuestion.metadata.category }}
                </span>
              </div>
              <h2 class="text-xl font-semibold text-slate-100 leading-relaxed">
                {{ currentQuestion.question }}
              </h2>
            </div>

            <!-- Answer Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                  v-for="(answer, index) in currentQuestion.answers"
                  :key="answer.id"
                  class="group relative p-5 text-left rounded-xl transition-all duration-300 transform h-fit"
                  :class="{
                    // Normal state (no explanation shown)
                    'bg-slate-700/50 hover:bg-teal-500/20 border border-slate-600/50 hover:border-teal-500/50 hover:scale-[1.02] hover:shadow-lg': !showExplanation,
                    // Selected answer when explanation shown
                    'bg-teal-500/20 border border-teal-500/50': !showExplanation && selectedAnswer === answer.id,
                    // Correct answer highlight (explanation shown)
                    'bg-emerald-500/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/20': showExplanation && answer.id === currentQuestion.correctAnswer,
                    // Wrong selected answer highlight (explanation shown)
                    'bg-red-500/20 border border-red-500/50 shadow-lg shadow-red-500/20': showExplanation && selectedAnswer === answer.id && answer.id !== currentQuestion.correctAnswer,
                    // Other answers when explanation shown (dimmed)
                    'bg-slate-700/30 border border-slate-600/30 opacity-70': showExplanation && selectedAnswer !== answer.id && answer.id !== currentQuestion.correctAnswer
                  }"
                  :disabled="showExplanation"
                  @click="selectAnswer(answer.id)">

  <span class="flex items-start gap-3">
    <span
        class="w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-300"
        :class="{
          // Normal state
          'from-slate-600 to-slate-700 text-slate-300 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white': !showExplanation && selectedAnswer !== answer.id,

          // Selected (no explanation)
          'from-teal-500 to-teal-600 text-white group-hover:animate-pulse': !showExplanation && selectedAnswer === answer.id,

          // Correct answer (explanation shown)
          'from-emerald-500 to-emerald-600 text-white': showExplanation && answer.id === currentQuestion.correctAnswer,

          // Wrong selected answer (explanation shown)
          'from-red-500 to-red-600 text-white': showExplanation && selectedAnswer === answer.id && answer.id !== currentQuestion.correctAnswer,

          // Other answers (explanation shown)
          'from-slate-600 to-slate-700 text-slate-400': showExplanation && selectedAnswer !== answer.id && answer.id !== currentQuestion.correctAnswer
        }">
      {{ getIdByIndex(index) }}

      <!-- Icons for correct/wrong when explanation shown -->
      <span
          v-if="showExplanation && answer.id === currentQuestion.correctAnswer"
          class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </span>

      <span
          v-if="showExplanation && selectedAnswer === answer.id && answer.id !== currentQuestion.correctAnswer"
          class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </span>
    </span>

    <span
        class="text-sm leading-relaxed"
        :class="{
            'text-slate-200': !showExplanation,
            'text-emerald-100 font-medium': showExplanation && answer.id === currentQuestion.correctAnswer,
            'text-red-100': showExplanation && selectedAnswer === answer.id && answer.id !== currentQuestion.correctAnswer,
            'text-slate-400': showExplanation && selectedAnswer !== answer.id && answer.id !== currentQuestion.correctAnswer
          }">
      {{ answer.text }}
    </span>
  </span>

                <!-- Hover overlay (only when no explanation) -->
                <span
                    v-if="!showExplanation"
                    class="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </button>
            </div>

            <div
                v-if="showExplanation"
                class="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-slide-up">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-red-300 font-semibold mb-2">Nicht ganz richtig</h3>
                  <p class="text-slate-200 text-sm leading-relaxed mb-3">{{ currentQuestion.explanation }}</p>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-2 py-1 bg-teal-500/20 text-teal-300 rounded">Richtige Antwort: {{
                        getIdByIndex(currentQuestion.answers.findIndex(a => a.id === currentQuestion.correctAnswer))
                      }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center pt-6 border-t border-slate-700/50">
              <button
                  class="group flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-slate-200 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="currentQuestionIndex === 0"
                  @click="prev">
                <svg
                    class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span class="text-sm font-medium">Vorherige</span>
              </button>

              <div class="flex items-center gap-2">
                <div v-for="(count, index) in settings.questions" :key="count" class="w-2 h-2  rounded-full" :class="{'bg-teal-500': currentQuestionIndex === index, 'bg-slate-600': currentQuestionIndex !== index}"/>
              </div>

              <button
                  class="group relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  :disabled="!selectedAnswer"
                  @click="next">
                <span class="flex items-center gap-2">
                  <span class="text-sm">Nächste</span>
                  <svg
                      class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
                <span
                    class="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Stats -->
        <div class="text-center mt-8 text-slate-400 text-sm">
          <p>🎯 Richtige Antworten: <span class="text-teal-400 font-medium">{{
              currentQuestionIndex
            }}/{{ settings.questions }}</span> • ⏱️ Zeit: <span
              class="text-orange-400 font-medium tabular-nums">{{ elapsedTime }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Question} from "~~/server/assets/data/questions"
import StepIndicator from "~/components/ui/stepIndicator/StepIndicator.vue"
import {useTimer} from "~/composables/useTimer";

// Settings
const settings = reactive({
  questions: 8,
})

// Timer
const timer = useTimer()


const currentQuestionIndex = ref(0)
const selectedAnswer = ref<string>()
const showExplanation = ref(false)
const isQuizCompleted = ref(false)


// Track user's actual answers for each question
const userAnswers = ref<Map<number, string>>(new Map())

// Stats
const wrongQuestions = ref<Set<number>>(new Set())

const {data, pending: isLoading, refresh} = useFetch<{ questions: Question[] }>('/api/quiz', {server: false})

const questions = computed(() => data.value?.questions ?? [])

// Computed
const currentQuestion = computed(() => {
  const question = questions.value[currentQuestionIndex.value]
  if (!question) return null

  return question
})


const correctAnswers = computed(() => {
  let count = 0
  userAnswers.value.forEach((userAnswer, questionIndex) => {
    const question = questions.value[questionIndex]
    if (question?.correctAnswer === userAnswer) count++
  })
  return count
})
const wrongAnswersCount = computed(() => wrongQuestions.value.size)


const accuracy = computed(() => {
  const total = correctAnswers.value + wrongAnswersCount.value
  return total > 0 ? Math.round((correctAnswers.value / total) * 100) : 0
})


const getIdByIndex = (index: number) => ['A', 'B', 'C', 'D'][index]

const selectAnswer = (id: string) => {

  if (selectedAnswer.value && selectedAnswer.value === id) {
    next()
    return
  }

  selectedAnswer.value = id
  userAnswers.value.set(currentQuestionIndex.value, id)
}

const prev = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    // Restore what the user actually selected for this question
    selectedAnswer.value = userAnswers.value.get(currentQuestionIndex.value)

    // Check if we should show explanation for this question
    const userAnswer = userAnswers.value.get(currentQuestionIndex.value)
    const correctAnswer = questions.value[currentQuestionIndex.value]?.correctAnswer
    showExplanation.value = userAnswer !== undefined && userAnswer !== correctAnswer
  }
}

const next = () => {
  const isCorrect = currentQuestion.value?.correctAnswer === selectedAnswer.value

  if (showExplanation.value) {
    showExplanation.value = false
    selectedAnswer.value = undefined
    moveToNextQuestion()
  } else if (isCorrect) {
    selectedAnswer.value = undefined
    moveToNextQuestion()
  } else {
    wrongQuestions.value.add(currentQuestionIndex.value)
    showExplanation.value = true
  }
}

const moveToNextQuestion = () => {
  if (currentQuestionIndex.value < settings.questions - 1) {
    currentQuestionIndex.value++

    // Restore user's answer for the new question
    selectedAnswer.value = userAnswers.value.get(currentQuestionIndex.value)

    // Check if we should show explanation for this question
    const userAnswer = userAnswers.value.get(currentQuestionIndex.value)
    const correctAnswer = questions.value[currentQuestionIndex.value]?.correctAnswer
    showExplanation.value = userAnswer !== undefined && userAnswer !== correctAnswer
  } else {
    isQuizCompleted.value = true
    timer.pause()
  }
}

const restartQuiz = async () => {
  await refresh()
  currentQuestionIndex.value = 0
  selectedAnswer.value = undefined
  showExplanation.value = false
  wrongQuestions.value.clear()
  isQuizCompleted.value = false
  userAnswers.value.clear()
  timer.reset()
}
</script>
<template>
  <div>
    <div
        v-if="isLoading || !data || !currentQuestion"
        class="relative z-10 min-h-screen flex justify-center items-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p class="text-slate-400">Quiz wird geladen...</p>
      </div>
    </div>
    <div v-else class="mb-10">
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
      <div class="absolute top-16 left-16 w-2 h-2 bg-teal-400 rounded-full animate-pulse"/>
      <div class="absolute top-40 right-32 w-1 h-1 bg-teal-400 rounded-full animate-ping"/>
      <div
          class="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
          style="animation-delay: 1s;"/>

      <div class="relative z-10 min-h-screen p-4">
        <div class="w-full max-w-4xl mx-auto animate-fade-in">

          <!-- Header with Progress -->
          <div class="text-center">
            <div class="inline-flex items-center gap-3 mb-4">
              <img src="/favicon.svg" class="w-10 h-10" alt="sbf trainer icon">
              <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent">
                SBF Trainer
              </h1>
            </div>

            <!-- Progress Indicator -->
            <div class="flex items-center justify-center gap-2 mb-2">
              <div class="flex gap-1">
                <StepIndicator :total="settings.questions" :current="currentQuestionIndex" variant="pill"/>
              </div>
            </div>
            <p class="text-slate-400 text-sm">Frage {{ currentQuestionIndex + 1 }} von {{ settings.questions }}</p>
          </div>

          <!-- Main Question Card -->
          <div class="mt-1.5 relative">
            <!-- Glow Effect -->
            <div
                class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>
            <div
                class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-2xl">
              <Transition name="question" mode="out-in" appear>
                <div :key="currentQuestionIndex" class="question-content">

                  <!-- Question -->
                  <div class="min-h-[100px] flex flex-col justify-start">
                    <div class="inline-flex items-center gap-2 mb-4">
                <span
                    class="px-3 py-1 text-xs font-medium capitalize bg-ocean-500/20 text-ocean-300 rounded-full border border-ocean-500/30">
                    {{ currentQuestion.metadata.category }}
                </span>
                    </div>
                    <h2 class="text-2xl font-semibold text-slate-100 leading-snug text-pretty">
                      {{ currentQuestion.question }}
                    </h2>
                  </div>

                  <!-- 🎯 ADD IMAGE DISPLAY HERE -->
                  <div v-if="currentQuestion.images?.length" class="mt-4 flex justify-center">
                    <div class="bg-white rounded-lg p-4 shadow-lg max-w-xs">
                      <div class="flex gap-2">
                        <img
                            v-for="(img, index) in currentQuestion.images"
                            :key="index"
                            :src="img"
                            :alt="`${currentQuestion.question} - Bild ${index + 1}`"
                            :class="currentQuestion.images.length === 1 ? 'w-full' : 'flex-1'"
                            class="h-auto rounded max-h-48 object-contain"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Answer Grid -->
                  <TransitionGroup name="answers" tag="div" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8" appear>
                    <button
                        v-for="(answer, index) in currentQuestion.answers"
                        :key="`q${currentQuestionIndex}-${answer.id}`"
                        :class="[
                        'group relative p-2.5 md:p-5 text-left rounded-xl transition-colors duration-300 touch-manipulation',
                        `answer-${index}`,
                        {
                          // Normal state (no explanation shown)
                          'bg-slate-700/50 hover:bg-teal-500/20 border border-slate-600/50 hover:border-teal-500/50 hover:shadow-lg': !showExplanation,
                          // Selected answer when explanation shown
                          'bg-teal-500/20 border border-teal-500/50': !showExplanation && selectedAnswer === answer.id,
                          // Correct answer highlight (explanation shown)
                          'bg-emerald-500/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/20': showExplanation && answer.id === currentQuestion.correctAnswer,
                          // Wrong selected answer highlight (explanation shown)
                          'bg-red-500/20 border border-red-500/50 shadow-lg shadow-red-500/20': showExplanation && selectedAnswer === answer.id && answer.id !== currentQuestion.correctAnswer,
                          // Other answers when explanation shown (dimmed)
                          'bg-slate-700/30 border border-slate-600/30 opacity-70': showExplanation && selectedAnswer !== answer.id && answer.id !== currentQuestion.correctAnswer
                        }
                      ]"
                        style="-webkit-tap-highlight-color: transparent;"
                        :disabled="showExplanation"
                        @click="selectAnswer(answer.id)">

  <span class="flex items-center gap-3">
    <span
        class="w-8 h-8 shrink-0 bg-gradient-to-r rounded-lg flex items-center justify-center font-bold text-sm"
        :class="{
          // Normal state
          'from-slate-600 to-slate-700 text-slate-300 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white': !showExplanation && selectedAnswer !== answer.id,

          // Selected (no explanation)
          'from-teal-500 to-teal-600 text-white': !showExplanation && selectedAnswer === answer.id,

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
                  </TransitionGroup>

                  <div
                      v-if="showExplanation"
                      class="my-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-slide-up">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-red-300 font-semibold mb-2">Nicht ganz richtig</h3>
                        <p class="text-slate-200 text-sm leading-relaxed mb-3">{{ currentQuestion.explanation }}</p>
                        <div class="flex items-center gap-2 text-xs">
                    <span class="px-2 py-1 bg-teal-500/20 text-teal-300 rounded">Richtige Antwort: {{
                        getIdByIndex(currentQuestion.answers.findIndex(a => a.id === currentQuestion?.correctAnswer))
                      }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="mt-8 border-t border-slate-700/50">
                    <div class="md:hidden mb-4 flex justify-center">
                      <StepIndicator :total="settings.questions" :current="currentQuestionIndex"/>
                    </div>
                    <!-- Navigation -->
                    <div class="flex justify-between items-center  ">
                      <button
                          class="group flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-slate-200 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          :disabled="currentQuestionIndex === 0"
                          @click="prev">
                        <svg
                            class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span class="text-sm font-medium">Vorherige</span>
                      </button>

                      <StepIndicator
                          class="hidden md:block" :total="settings.questions"
                          :current="currentQuestionIndex"/>

                      <button
                          class="group px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                      </button>
                    </div>
                  </footer>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Bottom Stats -->
          <div class="text-center mt-8 text-slate-400 text-sm">
            <p>🎯 Richtige Antworten: <span class="text-teal-400 font-medium">{{
                correctAnswers
              }}/{{ settings.questions }}</span> • ⏱️ Zeit: <span
                class="text-orange-400 font-medium tabular-nums">{{ timer.elapsedTime }}</span></p>
          </div>
        </div>
      </div>
      <Transition name="modal" appear>
        <div
            v-if="isQuizCompleted"
            class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Transition name="modal-content" appear>
            <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
              <div class="text-center">
                <!-- Success Icon -->
                <div class="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>

                <h2 class="text-2xl font-bold text-white mb-2">Quiz abgeschlossen! 🎉</h2>
                <p class="text-slate-400 mb-6">Gut gemacht, zukünftiger Kapitän!</p>

                <!-- Stats -->
                <div class="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-slate-300">Richtige Antworten:</span>
                    <span class="text-teal-400 font-bold">{{ correctAnswers }}/{{ settings.questions }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-300">Falsche Antworten:</span>
                    <span class="text-red-400 font-bold">{{ wrongAnswersCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-300">Genauigkeit:</span>
                    <span class="text-orange-400 font-bold">{{ accuracy }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-300">Zeit:</span>
                    <span class="text-blue-400 font-bold tabular-nums">{{ timer.elapsedTime }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                  <button
                      class="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      @click="restartQuiz">
                    Neues Quiz starten
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>

    <NuxtLink class="absolute right-0 bottom-0 z-50" to="daily">Daily Podcast</NuxtLink>
  </div>
</template>

<!-- Add these CSS classes to your <style> section or global CSS -->
<style scoped>
/* Question transition styles */
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

/* Modal content slide up from bottom */
.modal-content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.3s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.9);
}

.modal-content-leave-to {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>

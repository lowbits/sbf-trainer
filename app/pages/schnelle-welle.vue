<script setup lang="ts">
import type {Question} from "~~/server/assets/data/questions"
import StepIndicator from "~/components/ui/stepIndicator/StepIndicator.vue"
import {useTimer} from "~/composables/useTimer";
import QuestionContent from "~/components/quiz/QuestionContent.vue";
import Logo from "~/components/logos/Logo.vue";

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
const currentQuestion = computed<Question | null>(() => {
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
            <Logo />

            <!-- Progress Indicator -->
            <div class="flex items-center justify-center gap-2 mb-2">
              <div class="flex gap-1">
                <StepIndicator :total="settings.questions" :current="currentQuestionIndex" variant="pill"/>
              </div>
            </div>
            <p class="text-slate-400 text-sm">Frage {{ currentQuestionIndex + 1 }} von {{ settings.questions }}</p>
          </div>

          <!-- Main Question Card -->
          <div class="mt-4 relative">
            <!-- Glow Effect -->
            <div
                class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>


            <div
                class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-2xl">
              <QuestionContent
                  :question="currentQuestion" mode="training" :background="false" :wrap="false"
                  :show-explanation="showExplanation"
                  show-category :selected="selectedAnswer" @click:answer="selectAnswer"/>

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

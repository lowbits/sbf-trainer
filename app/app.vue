<script lang="ts" setup>
import {type Question, questions} from "~~/data/questions"
import StepIndicator from "~/components/ui/stepIndicator/StepIndicator.vue"

// Settings
const settings = reactive({
  questions: 8,
})

// Timer
const startTime = ref(Date.now())
const timestamp = useTimestamp({interval: 1000, controls: true})

// Quiz state
const shuffledQuestions = ref<Question[]>([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<string>()
const showExplanation = ref(false)
const isQuizCompleted = ref(false)
const isLoading = ref(true)

// Track user's actual answers for each question
const userAnswers = ref<Map<number, string>>(new Map())

// Stats
const wrongQuestions = ref<Set<number>>(new Set())

// Computed
const currentQuestion = computed(() => {
  const question = shuffledQuestions.value[currentQuestionIndex.value]
  if (!question) return null

  return {
    ...question,
    answers: [...question.answers].sort(() => Math.random() - 0.5)
  }
})

const elapsedTime = computed(() => {
  const elapsed = timestamp.timestamp.value - startTime.value
  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
})

const correctAnswers = computed(() => {
  let count = 0
  userAnswers.value.forEach((userAnswer, questionIndex) => {
    const question = shuffledQuestions.value[questionIndex]
    if (question?.correctAnswer === userAnswer) count++
  })
  return count
})
const wrongAnswersCount = computed(() => wrongQuestions.value.size)


const accuracy = computed(() => {
  const total = correctAnswers.value + wrongAnswersCount.value
  return total > 0 ? Math.round((correctAnswers.value / total) * 100) : 0
})

// Utils
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

const getIdByIndex = (index: number) => ['A', 'B', 'C', 'D'][index]

// Quiz actions
const initializeQuiz = () => {
  const allQuestions = shuffleArray(questions)
  shuffledQuestions.value = allQuestions.slice(0, settings.questions)

  isLoading.value = false
}

const selectAnswer = (id: string) => {
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
    const correctAnswer = shuffledQuestions.value[currentQuestionIndex.value]?.correctAnswer
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
    const correctAnswer = shuffledQuestions.value[currentQuestionIndex.value]?.correctAnswer
    showExplanation.value = userAnswer !== undefined && userAnswer !== correctAnswer
  } else {
    isQuizCompleted.value = true
    timestamp.pause()
  }
}

const restartQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = undefined
  showExplanation.value = false
  wrongQuestions.value.clear()
  isQuizCompleted.value = false
  isLoading.value = true
  userAnswers.value.clear()
  startTime.value = Date.now()
  timestamp.resume()
  initializeQuiz()
}

// Initialize
onMounted(() => {
  initializeQuiz()
})
</script>

<template>
  <NuxtPwaManifest/>
  <div
      class="relative min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white overflow-hidden">
    <div v-if="isLoading || !currentQuestion" class="relative z-10 min-h-screen flex justify-center items-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p class="text-slate-400">Quiz wird geladen...</p>
      </div>
    </div>
    <div v-else>
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
                class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-2xl animate-slide-up">
              <!-- Question -->
              <div class="mb-8 min-h-[100px] flex flex-col justify-start">
                <div class="inline-flex items-center gap-2 mb-4">
                <span
                    class="px-3 py-1 text-xs font-medium capitalize bg-ocean-500/20 text-ocean-300 rounded-full border border-ocean-500/30">
                    {{ currentQuestion.metadata.category }}
                </span>
                </div>
                <h2 class="text-2xl font-semibold text-slate-100 leading-snug">
                  {{ currentQuestion.question }}
                </h2>
              </div>

              <!-- 🎯 ADD IMAGE DISPLAY HERE -->
              <div v-if="currentQuestion.images" class="flex justify-center">
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
              <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-8">
                <button
                    v-for="(answer, index) in currentQuestion.answers"
                    :key="answer.id"
                    class="group relative p-2.5 md:p-5 text-left rounded-xl transition-all duration-300 transform"
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
                        getIdByIndex(currentQuestion.answers.findIndex(a => a.id === currentQuestion?.correctAnswer))
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="border-t md:pt-3 border-slate-700/50">
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

                  <StepIndicator class="hidden md:block" :total="settings.questions" :current="currentQuestionIndex"/>

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
                class="text-orange-400 font-medium tabular-nums">{{ elapsedTime }}</span></p>
          </div>
        </div>
      </div>
      <div
          v-if="isQuizCompleted"
          class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                <span class="text-blue-400 font-bold tabular-nums">{{ elapsedTime }}</span>
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
      </div>
    </div>
  </div>
</template>

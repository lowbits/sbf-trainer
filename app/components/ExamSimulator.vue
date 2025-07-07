<script setup lang="ts">
import CardHeader from "~/components/ui/cards/CardHeader.vue";
import {computed, ref} from "vue";
import {useTimer} from "~/composables/useTimer";
import {useQuiz} from "~/composables/useQuiz";
import ExamResultModal from "~/components/modals/ExamResultModal.vue";
import QuestionContent from "~/components/quiz/QuestionContent.vue";
import QuestionPicker from "~/components/quiz/QuestionPicker.vue";

const props = defineProps<{
  exam: ExamSheet
}>()


const showExamPreview = ref<boolean>(false);

const timer = useTimer({immediate: false})

const isExamActive = ref<boolean>(false);

const currentQuestionIndex = ref<number>(0);

const showQuestionPicker = ref(false);

const selectedAnswer = ref<string>();

const showResultsModal = ref(false);

const isReviewMode = ref(false);
const showAnswerReview = ref(false);
const reviewFilter = ref<'all' | 'correct' | 'wrong' | 'unanswered'>('all');

const {track, answers, reset} = useQuiz({questions: props.exam.questions})

const currentQuestion = computed<ExamQuestion | null>(() => {
  return props.exam?.questions[currentQuestionIndex.value] || null;
});

useHead({
  bodyAttrs: {
    class: computed(() => isExamActive.value || isReviewMode.value ? 'overflow-hidden overscoll-none' : '')
  }
});

const progress = computed(() => {
  if (!props.exam) return 0;
  return ((currentQuestionIndex.value + 1) / props.exam.questions.length) * 100;
});

const examStats = computed(() => {
  if (!props.exam) return null;

  const basicQuestions = props.exam.questions.filter(q => q.originalQuestionNumber <= 72);
  const specificQuestions = props.exam.questions.filter(q => q.originalQuestionNumber > 72);

  return {
    total: props.exam.questions.length,
    basic: basicQuestions.length,
    specific: specificQuestions.length,
    timeLimit: props.exam.metadata.timeLimit,
    passingScore: props.exam.metadata.passingScore
  };
});

// Review mode computeds
const reviewStats = computed(() => {
  if (!props.exam) return null;

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  props.exam.questions.forEach(question => {
    const userAnswer = answers.value.get(question.id);
    if (!userAnswer) {
      unanswered++;
    } else if (userAnswer === question.correctAnswer) {
      correct++;
    } else {
      wrong++;
    }
  });

  return {correct, wrong, unanswered};
});

const filteredQuestions = computed(() => {
  if (!props.exam || reviewFilter.value === 'all') {
    return props.exam?.questions.map((q, index) => ({...q, originalIndex: index})) || [];
  }

  return props.exam.questions
      .map((q, index) => ({...q, originalIndex: index}))
      .filter(q => {
        const userAnswer = answers.value.get(q.id);

        switch (reviewFilter.value) {
          case 'correct':
            return userAnswer === q.correctAnswer;
          case 'wrong':
            return userAnswer && userAnswer !== q.correctAnswer;
          case 'unanswered':
            return !userAnswer;
          default:
            return true;
        }
      });
});

const getQuestionStatus = (questionId: string) => {
  const userAnswer = answers.value.get(questionId);
  const question = props.exam?.questions.find(q => q.id === questionId);

  if (!userAnswer) return 'unanswered';
  return userAnswer === question?.correctAnswer ? 'correct' : 'wrong';
};



const selectAnswer = (answerId: string) => {
  if (!currentQuestion.value) return;

  // In review mode, don't allow changing answers
  if (isReviewMode.value) {
    return;
  }

  if (selectedAnswer.value === answerId) {
    nextQuestion()
    return
  }

  selectedAnswer.value = answerId;
  track(currentQuestion.value.id, answerId);
};


const timeStringToSeconds = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60) + seconds;
};

const secondsToTimeString = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Calculate time left based on your timer
const timeLeft = computed(() => {
  if (!examStats.value || !isExamActive.value) return 0;

  const timeLimitSeconds = examStats.value.timeLimit * 60; // Convert minutes to seconds
  const elapsedSeconds = timeStringToSeconds(timer.elapsedTime.value);

  return Math.max(0, timeLimitSeconds - elapsedSeconds);
});

const formattedTimeLeft = computed(() => {
  return secondsToTimeString(timeLeft.value);
});

const isTimeRunningOut = computed(() => {
  return timeLeft.value <= 300; // Last 5 minutes
});

const shouldShowExplanation = computed(() => {
  return isReviewMode.value;
});

const startExam = (): void => {
  if (props.exam) {
    timer.reset()
    timer.resume()
    isExamActive.value = true
  }
};

const retryExam = () => {
  timer.reset()
  reset()
  selectedAnswer.value = undefined
  currentQuestionIndex.value = 0
  showResultsModal.value = false
  isExamActive.value = true
  timer.resume()
}

const startReviewMode = () => {
  showResultsModal.value = false;
  isExamActive.value = false;
  isReviewMode.value = true;
  currentQuestionIndex.value = 0;
  showAnswerReview.value = true;
  showQuestionPicker.value = true;
};

const exitReview = () => {
  isReviewMode.value = false;
  showAnswerReview.value = false;
};


const previewExam = (): void => {
  showExamPreview.value = !showExamPreview.value;
};

const nextQuestion = () => {
  if (props.exam && currentQuestionIndex.value < props.exam.questions.length - 1) {
    currentQuestionIndex.value++;
  } else {
    endExam('completed');
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const goToQuestion = (index: number) => {
  if (index >= 0 && index < (props.exam?.questions.length || 0)) {
    currentQuestionIndex.value = index;
  }
};

const endExam = (reason: 'completed' | 'timeout' | 'manual') => {
  isExamActive.value = false;
  timer.pause();

  // Calculate results and show modal
  examResults.value = calculateExamResults();
  showResultsModal.value = true;

  console.log(`Exam ended: ${reason}`);
};


const handleFilterUpdate = (filter: string) => {
  reviewFilter.value = filter as any;
};

const examResults = ref<any>(null);

// Update your examResults computed to return the results object
const calculateExamResults = () => {
  if (!props.exam) return null;

  let correctBasic = 0;
  let correctSpecific = 0;
  let totalCorrect = 0;

  props.exam.questions.forEach(question => {
    const userAnswer = answers.value.get(question.id);
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) {
      totalCorrect++;
      if (question.originalQuestionNumber <= 72) {
        correctBasic++;
      } else {
        correctSpecific++;
      }
    }
  });

  const passed =
      correctBasic >= examStats.value?.passingScore.basic &&
      correctSpecific >= examStats.value?.passingScore.specific &&
      totalCorrect >= examStats.value?.passingScore.total;

  return {
    correctBasic,
    correctSpecific,
    totalCorrect,
    totalQuestions: props.exam.questions.length,
    basicQuestions: examStats.value?.basic || 0,
    specificQuestions: examStats.value?.specific || 0,
    passed,
    answeredQuestions: answers.value.size
  };
};

watch(timeLeft, (newTimeLeft) => {
  if (newTimeLeft <= 0 && isExamActive.value) {
    endExam('timeout');
  }
});

watch(currentQuestionIndex, () => {
  if (currentQuestion.value) {
    selectedAnswer.value = answers.value.get(currentQuestion.value.id) || undefined;
  }
});
</script>
<template>
  <div
      v-if="isExamActive || isReviewMode || showResultsModal"
      class="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm">
    <div class="h-full flex flex-col">
      <div v-if="isReviewMode" class="bg-blue-500/20 border-b border-blue-500/30 px-3 md:px-4 py-3">
        <!-- Mobile Layout -->
        <div class="md:hidden">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="text-blue-300 font-medium text-sm">Review Modus</span>
            </div>
            <button
                class="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded text-xs transition-colors"
                @click="exitReview"
            >
              Beenden
            </button>
          </div>
          <!-- Stats row -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-emerald-500 rounded-full"/>
                <span class="text-emerald-400">{{ reviewStats?.correct }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-red-500 rounded-full"/>
                <span class="text-red-400">{{ reviewStats?.wrong }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-slate-500 rounded-full"/>
                <span class="text-slate-400">{{ reviewStats?.unanswered }}</span>
              </div>
            </div>
            <button
                class="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors"
                @click="showQuestionPicker = !showQuestionPicker"
            >
              {{ showQuestionPicker ? 'Schließen' : 'Übersicht' }}
            </button>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden md:flex items-center justify-between max-w-6xl mx-auto">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="text-blue-300 font-medium">Antworten durchgehen</span>
            <div class="flex items-center gap-4 text-xs ml-4">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-emerald-500 rounded-full"/>
                <span class="text-emerald-400">{{ reviewStats?.correct }} richtig</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-red-500 rounded-full"/>
                <span class="text-red-400">{{ reviewStats?.wrong }} falsch</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-slate-500 rounded-full"/>
                <span class="text-slate-400">{{ reviewStats?.unanswered }} offen</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
                class="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
                @click="showQuestionPicker = !showQuestionPicker"
            >
              {{ showQuestionPicker ? 'Schließen' : 'Übersicht' }}
            </button>
            <button
                class="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg text-sm transition-colors"
                @click="exitReview"
            >
              Beenden
            </button>
          </div>
        </div>
      </div>
      <!-- Header with timer and controls -->
      <div v-if="isExamActive" class="bg-slate-800/90 border-b border-slate-700 px-3 md:px-6 py-3 md:py-4">
        <!-- Mobile Layout -->
        <div class="md:hidden">
          <!-- Top row: Title and Exit button -->
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-white truncate flex-1 mr-3">{{ exam.title }}</h2>
            <button
                class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex-shrink-0"
                @click="endExam('manual')"
            >
              Beenden
            </button>
          </div>

          <!-- Bottom row: Progress, Question counter, and Timer -->
          <div class="flex items-center gap-3">
            <!-- Progress bar with question counter -->
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-slate-400">Frage {{ currentQuestionIndex + 1 }}/{{ examStats?.total }}</span>
                <span class="text-xs font-mono font-bold" :class="isTimeRunningOut ? 'text-red-400' : 'text-green-400'">
            {{ formattedTimeLeft }}
          </span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2">
                <div
                    class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"
                />
              </div>
            </div>

            <!-- Elapsed time (compact) -->
            <div class="text-right flex-shrink-0">
              <div class="text-xs text-slate-400">Elapsed</div>
              <div class="text-sm font-mono font-bold text-blue-400">{{ timer.elapsedTime }}</div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout (original with minor tweaks) -->
        <div class="hidden md:flex items-center justify-between">
          <div class="flex items-center gap-6">
            <h2 class="text-xl font-semibold text-white">{{ exam.title }}</h2>
            <div class="flex items-center gap-4">
              <div class="text-sm text-slate-300">
                Frage {{ currentQuestionIndex + 1 }} von {{ examStats?.total }}
              </div>
              <div class="w-32 bg-slate-700 rounded-full h-2">
                <div
                    class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Timer -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm text-slate-400">Verbleibende Zeit</div>
                <div
                    class="text-lg font-mono font-bold"
                    :class="isTimeRunningOut ? 'text-red-400' : 'text-green-400'"
                >
                  {{ formattedTimeLeft }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-slate-400">Verstrichene Zeit</div>
                <div class="text-lg font-mono font-bold text-blue-400">
                  {{ timer.elapsedTime }}
                </div>
              </div>
            </div>

            <!-- Exit button -->
            <button
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                @click="endExam('manual')"
            >
              Prüfung beenden
            </button>
          </div>
        </div>
      </div>

      <QuestionContent
          :question="currentQuestion" :selected="selectedAnswer" :mode="isReviewMode ? 'training' : 'exam'"
          scroll
          :show-explanation="shouldShowExplanation" @click:answer="selectAnswer"/>


      <ExamResultModal
          :show="showResultsModal" :results="examResults" :passing-score="examStats?.passingScore"
          :time-elapsed="timer.elapsedTime.value" @close="showResultsModal = false" @review-answers="startReviewMode"
          @retry-exam="retryExam"/>


      <QuestionPicker
          :show="showQuestionPicker"
          :questions="isReviewMode ? filteredQuestions : exam.questions"
          :current-question-index="currentQuestionIndex"
          :mode="isReviewMode ? 'review' : 'exam'"
          :user-answers="answers"
          :filter="reviewFilter"
          :stats="reviewStats"
          @close="showQuestionPicker = false"
          @go-to-question="goToQuestion"
          @update-filter="handleFilterUpdate"
      />

      <!-- Navigation -->
      <div class="bg-slate-800/90 border-t border-slate-700 px-2 md:px-6 py-4">
        <div class="flex items-center justify-between gap-2">
          <!-- Previous Button -->
          <button
              :disabled="currentQuestionIndex === 0"
              class="px-2 md:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors flex-shrink-0"
              @click="previousQuestion"
          >
            <span class="md:hidden">←</span>
            <span class="hidden md:inline">← Vorherige</span>
          </button>

          <!-- Question Navigation - Different layouts for mobile/desktop -->
          <div class="flex-1 flex items-center justify-center">
            <!-- Mobile: Simplified navigation -->
            <button
                class="md:hidden flex items-center gap-2"
                @click="showQuestionPicker = !showQuestionPicker"
            >

              <!-- Current question indicator -->
              <span class="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1">
                <span class="text-slate-400 text-sm">Frage</span>
                <span class="text-white font-semibold">{{ currentQuestionIndex + 1 }}</span>
                <span class="text-slate-400 text-sm">von {{ exam.questions.length }}</span>
              </span>

            </button>

            <!-- Desktop: Show more question numbers with smart pagination -->
            <div class="hidden md:flex items-center gap-1">
              <!-- Show first few questions -->
              <template v-if="currentQuestionIndex <= 5">
                <button
                    v-for="index in Math.min(10, exam.questions.length)"
                    :key="index"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (index - 1) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(index - 1)"
                >
                  {{ index }}
                </button>
              </template>

              <!-- Show middle range around current question -->
              <template v-else-if="currentQuestionIndex > 5 && currentQuestionIndex < exam.questions.length - 5">
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(0)"
                >
                  1
                </button>
                <span class="text-slate-400 px-1">...</span>

                <button
                    v-for="index in 7"
                    :key="currentQuestionIndex + index - 3"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (currentQuestionIndex + index - 4) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(currentQuestionIndex + index - 4)"
                >
                  {{ currentQuestionIndex + index - 3 }}
                </button>

                <span class="text-slate-400 px-1">...</span>
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(exam.questions.length - 1)"
                >
                  {{ exam.questions.length }}
                </button>
              </template>

              <!-- Show last few questions -->
              <template v-else>
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(0)"
                >
                  1
                </button>
                <span class="text-slate-400 px-1">...</span>

                <button
                    v-for="index in 10"
                    :key="exam.questions.length - 10 + index"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (exam.questions.length - 10 + index - 1) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(exam.questions.length - 10 + index - 1)"
                >
                  {{ exam.questions.length - 10 + index }}
                </button>
              </template>
            </div>
          </div>

          <!-- Next Button -->
          <button
              class="px-2 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-shrink-0"
              @click="nextQuestion"
          >
      <span class="md:hidden">
        {{ currentQuestionIndex === (examStats?.total || 0) - 1 ? '✓' : '→' }}
      </span>
            <span class="hidden md:inline">
        {{ currentQuestionIndex === (examStats?.total || 0) - 1 ? 'Prüfung abschließen' : 'Nächste →' }}
      </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <CollapsibleCard class="mt-8" variant="purple" padding="narrow">
    <template #trigger>
      <CardHeader
          variant="purple"
          :title="exam.title"
          :subtitle="`${examStats?.total} Fragen • ${examStats?.timeLimit} Minuten`"
      >
        <template #icon>
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </template>
      </CardHeader>
    </template>

    <div class="py-6 space-y-6">
      <!-- ExamSimulator Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.total }}</div>
          <div class="text-xs text-slate-400">Fragen</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.basic }}</div>
          <div class="text-xs text-slate-400">Basis</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.specific }}</div>
          <div class="text-xs text-slate-400">Spezifisch</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.timeLimit }}</div>
          <div class="text-xs text-slate-400">Minuten</div>
        </div>
      </div>

      <!-- ExamSimulator Description -->
      <div class="p-4 bg-slate-700/20 rounded-lg">
        <p class="text-slate-300 text-sm">{{ exam.description }}</p>
      </div>

      <!-- Passing Requirements -->
      <div class="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <h4 class="font-semibold text-purple-300 mb-3">Bestehensvoraussetzungen</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">Basisfragen:</span>
            <span class="text-purple-300 font-medium">{{ examStats?.passingScore.basic }}/{{
                examStats?.basic
              }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Spezifische:</span>
            <span class="text-purple-300 font-medium">{{
                examStats?.passingScore.specific
              }}/{{ examStats?.specific }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Gesamt:</span>
            <span class="text-purple-300 font-medium">{{ examStats?.passingScore.total }}/{{
                examStats?.total
              }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
            @click="startExam">
          Prüfung starten
        </button>
        <button
            class="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 rounded-xl font-medium transition-all duration-300"
            @click="previewExam">
          {{ showExamPreview ? 'Vorschau ausblenden' : 'Fragen-Vorschau' }}
        </button>
      </div>

      <!-- ExamSimulator Preview -->
      <div v-if="showExamPreview" class="border-t border-slate-700/50 pt-6">
        <h4 class="font-semibold text-slate-200 mb-4">Fragen-Überblick</h4>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div
              v-for="(question, index) in exam.questions.slice(0, 5)"
              :key="question.id"
              class="p-3 bg-slate-700/20 rounded-lg">
            <div class="flex items-start gap-3">
                    <span
                        class="w-6 h-6 bg-purple-500/20 text-purple-300 rounded text-xs font-medium flex items-center justify-center flex-shrink-0">
                      {{ index + 1 }}
                    </span>
              <div class="flex-1 min-w-0">
                <p class="text-slate-300 text-sm line-clamp-2">{{ question.question }}</p>
                <div class="flex items-center gap-2 mt-2">
                        <span class="px-2 py-1 text-xs bg-slate-600/50 text-slate-400 rounded">
                          {{ question.originalQuestionNumber <= 72 ? 'Basis' : 'Spezifisch' }}
                        </span>
                  <span
                      v-if="question.images?.length"
                      class="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                          📸 Mit Bild
                        </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="exam.questions.length > 5" class="text-center text-slate-400 text-sm">
            ... und {{ exam.questions.length - 5 }} weitere Fragen
          </div>
        </div>
      </div>
    </div>
  </CollapsibleCard>
</template>
